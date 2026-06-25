/**
 * Modal context and provider for managing modals globally
 */
'use client';

import { createContext, useContext, useState, useCallback, ReactNode } from 'react';

export type ModalType = 'create-room' | 'join-room' | 'none';

interface ModalContextType {
  activeModal: ModalType;
  openModal: (type: ModalType) => void;
  closeModal: () => void;
}

const ModalContext = createContext<ModalContextType | undefined>(undefined);

export function ModalProvider({ children }: { children: ReactNode }) {
  const [activeModal, setActiveModal] = useState<ModalType>('none');

  const openModal = useCallback((type: ModalType) => {
    setActiveModal(type);
  }, []);

  const closeModal = useCallback(() => {
    setActiveModal('none');
  }, []);

  return (
    <ModalContext.Provider value={{ activeModal, openModal, closeModal }}>
      {children}
    </ModalContext.Provider>
  );
}

import { CreateRoomModal } from '@/components/modals/create-room-modal';
import { JoinRoomModal } from '@/components/modals/join-room-modal';

export function useModal() {
  const context = useContext(ModalContext);
  if (!context) {
    throw new Error('useModal must be used within ModalProvider');
  }
  return context;
}

export function GlobalModals() {
  const { activeModal, closeModal } = useModal();
  
  return (
    <>
      {activeModal === 'create-room' && (
        <CreateRoomModal isOpen={true} onClose={closeModal} />
      )}
      {activeModal === 'join-room' && (
        <JoinRoomModal isOpen={true} onClose={closeModal} />
      )}
    </>
  );
}
