---
title: 🚀Scalable, Promise-Based Modal System in React🚀
subtitle: The Problem with Modals in React
tags:
- React
- React Hook
- Redux
- React Components
published: '2025-12-02'
free: true
freedium_url: https://freedium-mirror.cfd/https://medium.com/@dawoodmsam422/scalable-promise-based-modal-system-in-react-76178c53d5ba
source_url: https://medium.com/@dawoodmsam422/scalable-promise-based-modal-system-in-react-76178c53d5ba
---

# 🚀Scalable, Promise-Based Modal System in React🚀

*The Problem with Modals in React*

*Published Dec 02, 2025 · Free: Yes*

### The Problem with Modals in React

If you've built a React application of any significant size, you've likely encountered the "Modal Hell." It usually starts innocent enough:

```javascript
const [isModalOpen, setIsModalOpen] = useState(false);
return (
  <>
    <button onClick={() => setIsModalOpen(true)}>Delete</button>
    <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} />
  </>
);
```

But then you need another modal. And another. And suddenly, your component state is cluttered with `isDeleteModalOpen`, `isEditModalOpen`, `isConfirmModalOpen`. Worse, you have to handle the data flow between the modal and the parent component, often leading to prop drilling or complex `useEffect` chains.

And what if you need to trigger a confirmation modal from a utility function or a Redux thunk? You're out of luck with the `useState` approach.

### The Solution: A Promise-Based, Redux-Powered Architecture

**Visuals:**

<picture>
  <source media="(max-width: 768px)" srcset="/img/medium/700/1*rz2PNtYoOPm864V_A82xng.png 1x">
  <source media="(min-width: 769px)" srcset="/img/medium/2000/1*rz2PNtYoOPm864V_A82xng.png 1x">
  <img src="/img/medium/700/1*rz2PNtYoOPm864V_A82xng.png" alt="None" width="1680" height="1524" loading="lazy" data-zoom-src="/img/medium/4000/1*rz2PNtYoOPm864V_A82xng.png" class="prose-image"/>
</picture>

<picture>
  <source media="(max-width: 768px)" srcset="/img/medium/700/1*CaCowsxXI2y46SWG5Ux7AQ.png 1x">
  <source media="(min-width: 769px)" srcset="/img/medium/2000/1*CaCowsxXI2y46SWG5Ux7AQ.png 1x">
  <img src="/img/medium/700/1*CaCowsxXI2y46SWG5Ux7AQ.png" alt="None" width="914" height="828" loading="lazy" data-zoom-src="/img/medium/4000/1*CaCowsxXI2y46SWG5Ux7AQ.png" class="prose-image"/>
</picture>

We wanted a solution that met the following criteria:

1. **Clean API**: Triggering a modal should be as simple as `await confirm(...)`.
2. **Decoupled**: The component triggering the modal shouldn't need to know about the modal's implementation details or maintain its open/closed state.
3. **Scalable**: Support for stacked modals (e.g., a "Confirm" modal on top of an "Edit" modal).
4. **Performance**: Avoid unnecessary re-renders in the consuming components.

Here is the architecture we built to achieve this.

### 1. The State: Redux Slice

We use Redux to manage the array of active modals. This allows us to stack modals easily.

```javascript
import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { ConfirmationState, ModalConfig } from "./confirmation.types";

const initialState: ConfirmationState = {
    modals: []
}

const confirmationSlice = createSlice({
    name: 'confirmation',
    initialState,
    reducers: {
        pushModal: (state: ConfirmationState, action: PayloadAction<ModalConfig>) => {
            state.modals.push(action.payload);
        },
        popModal: (state: ConfirmationState, action: PayloadAction<string>) => {
            state.modals = state.modals.filter((modal: ModalConfig) => modal.id !== action.payload);
        },
        updateModal: (state: ConfirmationState, action: PayloadAction<{ id: string; updates: Partial<ModalConfig> }>) => {
            const index = state.modals.findIndex((modal: ModalConfig) => modal.id === action.payload.id);
            if (index !== -1) {
                state.modals[index] = { ...state.modals[index], ...action.payload.updates };
            }
        },
        closeAllModals: (state: ConfirmationState) => {
            state.modals = [];
        }
    }
})

export const { pushModal, popModal, updateModal, closeAllModals } = confirmationSlice.actions;

export default confirmationSlice.reducer;
```

### 2. The Magic: The useConfirmation Hook

This is where the real magic happens. We use a module-level `Map` to store the resolve and reject functions of the Promise associated with each modal.

When you call confirm(), we:

1. Generate a unique ID (UUID). _// Or any unique identifier also works_
2. Create a new Promise.
3. Store the Promise's resolve and reject handlers in our `promiseMap` using the ID.
4. Dispatch the pushModal action to Redux with the ID and config.

```javascript
import { useDispatch } from 'react-redux';
import { v4 as uuidv4 } from 'uuid';
import { pushModal } from '../confirmation.slice';
import { ConfirmationOptions, ModalConfig } from '../confirmation.types';

// Module-level map to store promise resolvers
const promiseMap = new Map<string, { resolve: (value: boolean) => void; reject: (reason?: any) => void }>();

export const resolveConfirmation = (id: string, value: boolean) => {
    const handlers = promiseMap.get(id);
    if (handlers) {
        handlers.resolve(value);
        promiseMap.delete(id);
    }
};

export const rejectConfirmation = (id: string, reason?: any) => {
    const handlers = promiseMap.get(id);
    if (handlers) {
        handlers.reject(reason);
        promiseMap.delete(id);
    }
};

export const useConfirmation = () => {
    const dispatch = useDispatch();

    const confirm = (options: ConfirmationOptions): Promise<boolean> => {
        const id = uuidv4();

        return new Promise<boolean>((resolve, reject) => {
            promiseMap.set(id, { resolve, reject });

            const config: ModalConfig = {
                id,
                isOpen: true,
                ...options
            };

            dispatch(pushModal(config));
        });
    };

    return { confirm };
};
```

### 3. The Renderer: ConfirmationComponent

This component lives at the root of your application (or wherever you want modals to render). It reads the list of modals from Redux and renders them. Crucially, it uses `createPortal` to render the modals outside the current DOM hierarchy, avoiding z-index issues.

```javascript

import React from 'react';
import { createPortal } from "react-dom";
import { useDispatch, useSelector } from "react-redux";
import { AskConfirmation } from "./components/ask/ask.confirmation";
import { DeleteConfirmation } from "./components/delete/delete.confirmation";
import { popModal } from "./confirmation.slice";
import { selectModals } from "./confirmation.selector";
import { ModalConfig, ModalType } from "./confirmation.types";
import { resolveConfirmation } from "./hooks/useConfirmation";

const BASE_Z_INDEX = 999;

const ConfirmationComponent = () => {
    const modals = useSelector(selectModals);
    const dispatch = useDispatch();

    if (modals.length === 0) return null;

    const handleBackdropClick = () => {
        const topModal = modals[modals.length - 1];
        if (topModal) {
            resolveConfirmation(topModal.id, false);
            dispatch(popModal(topModal.id));
        }
    };

    return createPortal(
        <div
            className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto overflow-x-hidden bg-gray-900 bg-opacity-50 backdrop-blur-sm p-4 md:p-0"
            onClick={handleBackdropClick}
        >
            {modals.map((modal: ModalConfig, index: number) => (
                <div
                    key={modal.id}
                    className="absolute inset-0 flex items-center justify-center pointer-events-none"
                    style={{ zIndex: BASE_Z_INDEX + index }}
                >
                    <div
                        className="pointer-events-auto relative w-full max-w-md max-h-full"
                        onClick={(e) => e.stopPropagation()}
                    >
                        {renderModal(modal)}
                    </div>
                </div>
            ))}
        </div>,
        document.body
    );
}

const renderModal = (modal: ModalConfig) => {
    switch (modal.type) {
        case ModalType.DELETE:
            return <DeleteConfirmation config={modal} />;
        case ModalType.ASK:
            return <AskConfirmation config={modal} />;
        default:
            return <AskConfirmation config={modal} />;
    }
};

export default ConfirmationComponent;
```

### 4. Usage

Now, using a confirmation modal is incredibly simple:

```javascript
import useConfirmation from @confirmation;

const MyComponent = () => {
    const { confirm } = useConfirmation();
    const handleDelete = async () => {
        const isConfirmed = await confirm({
            title: 'Delete Item',
            message: 'Are you sure you want to delete this item?',
            type: ModalType.DELETE
        });
        if (isConfirmed) {
            // Perform delete action
            await deleteItem();
        }
    };
    return <button onClick={handleDelete}>Delete</button>;
};
```

### Benefits

- **No Local State**: The consuming component is clean and stateless regarding the modal.
- **Promise-Based Control Flow**: You can write linear, easy-to-read code using `async/await`.
- **Scalability**: We can easily add new modal types or stack multiple modals without changing the core logic.
- **Performance**: Only the ConfirmationComponent re-renders when a modal opens/closes, not the entire component tree.

This architecture has significantly simplified how we handle user confirmations and dialogs in our application, making the codebase cleaner and more maintainable.