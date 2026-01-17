import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export type OwnerType = 'individual' | 'company' | null;

interface OwnerFormData {
  // Step 1: Type
  ownerType: OwnerType;

  // Step 2: Identity
  taxId: string;
  taxIdType: 'NIE' | 'NIF' | null;
  firstName: string;
  lastName: string;
  companyName: string;

  // Step 3: Residence
  residenceCountry: string;
  residenceAddress: string;
  residenceCity: string;
  residencePostalCode: string;

  // Step 4: Bank
  iban: string;
}

interface OwnerFormState {
  step: number;
  data: OwnerFormData;
  editingId: string | null;
  setStep: (step: number) => void;
  updateData: (data: Partial<OwnerFormData>) => void;
  setEditingId: (id: string | null) => void;
  reset: () => void;
}

const initialData: OwnerFormData = {
  ownerType: null,
  taxId: '',
  taxIdType: null,
  firstName: '',
  lastName: '',
  companyName: '',
  residenceCountry: '',
  residenceAddress: '',
  residenceCity: '',
  residencePostalCode: '',
  iban: '',
};

export const useOwnerFormStore = create<OwnerFormState>()(
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
      setEditingId: (id) => set({ editingId: id }),
      reset: () => set({ step: 1, data: initialData, editingId: null }),
    }),
    {
      name: 'owner-form-storage',
    }
  )
);
