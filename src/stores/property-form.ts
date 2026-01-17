import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface OwnershipAssignment {
  ownerId: string;
  percentage: number;
}

interface PropertyFormData {
  // Step 1: Address
  streetType: string;
  streetName: string;
  streetNumber: string;
  floor: string;
  door: string;
  staircase: string;
  block: string;
  city: string;
  province: string;
  postalCode: string;

  // Step 2: Cadastral
  cadastralReference: string;
  cadastralValue: string;
  collectiveRevision: boolean;
  revisionYear: string;

  // Step 3: Ownership
  owners: OwnershipAssignment[];
}

interface PropertyFormState {
  step: number;
  data: PropertyFormData;
  editingId: string | null;
  setStep: (step: number) => void;
  updateData: (data: Partial<PropertyFormData>) => void;
  setOwners: (owners: OwnershipAssignment[]) => void;
  addOwner: (owner: OwnershipAssignment) => void;
  removeOwner: (ownerId: string) => void;
  updateOwnerPercentage: (ownerId: string, percentage: number) => void;
  setEditingId: (id: string | null) => void;
  reset: () => void;
}

const initialData: PropertyFormData = {
  streetType: '',
  streetName: '',
  streetNumber: '',
  floor: '',
  door: '',
  staircase: '',
  block: '',
  city: '',
  province: '',
  postalCode: '',
  cadastralReference: '',
  cadastralValue: '',
  collectiveRevision: false,
  revisionYear: '',
  owners: [],
};

export const usePropertyFormStore = create<PropertyFormState>()(
  persist(
    (set) => ({
      step: 1,
      data: initialData,
      editingId: null,
      setStep: (step) => set({ step }),
      updateData: (newData) =>
        set((state) => ({
          data: { ...state.data, ...newData },
        })),
      setOwners: (owners) =>
        set((state) => ({
          data: { ...state.data, owners },
        })),
      addOwner: (owner) =>
        set((state) => ({
          data: {
            ...state.data,
            owners: [...state.data.owners, owner],
          },
        })),
      removeOwner: (ownerId) =>
        set((state) => ({
          data: {
            ...state.data,
            owners: state.data.owners.filter((o) => o.ownerId !== ownerId),
          },
        })),
      updateOwnerPercentage: (ownerId, percentage) =>
        set((state) => ({
          data: {
            ...state.data,
            owners: state.data.owners.map((o) =>
              o.ownerId === ownerId ? { ...o, percentage } : o
            ),
          },
        })),
      setEditingId: (id) => set({ editingId: id }),
      reset: () => set({ step: 1, data: initialData, editingId: null }),
    }),
    {
      name: 'property-form-storage',
    }
  )
);
