'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Stepper } from '@/components/ui/stepper';
import { TaxIdInput } from '@/components/owners/tax-id-input';

import { useOwnerFormStore, type OwnerType } from '@/stores/owner-form';
import {
  useOwnerStep1Schema,
  useOwnerStep2Schema,
  useOwnerStep3Schema,
  useOwnerStep4Schema,
} from '@/hooks/useOwnerSchemas';
import { createOwner, updateOwner } from '@/app/[locale]/(protected)/owners/actions';
import type { Owner } from '@/db/schema';

interface OwnerFormProps {
  owner?: Owner;
}

/**
 * OwnerForm Component
 * Multi-step wizard for creating/editing owners
 * A11Y-01: 18px+ text throughout
 * A11Y-02: 48px touch targets
 * A11Y-05: Clear validation feedback
 */
export function OwnerForm({ owner }: OwnerFormProps) {
  const t = useTranslations('owner');
  const tCommon = useTranslations('common');
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  const { step, data, setStep, updateData, reset, setEditingId } = useOwnerFormStore();

  // Step labels for stepper
  const steps = [
    t('steps.type'),
    t('steps.identity'),
    t('steps.residence'),
    t('steps.bank'),
  ];

  // Initialize form with existing owner data if editing
  useEffect(() => {
    if (owner) {
      setEditingId(owner.id);
      updateData({
        ownerType: owner.ownerType as OwnerType,
        taxId: owner.taxId,
        taxIdType: owner.taxIdType as 'NIE' | 'NIF' | null,
        firstName: owner.firstName || '',
        lastName: owner.lastName || '',
        companyName: owner.companyName || '',
        residenceCountry: owner.residenceCountry,
        residenceAddress: owner.residenceAddress,
        residenceCity: owner.residenceCity,
        residencePostalCode: owner.residencePostalCode,
        iban: owner.iban || '',
      });
    }
    // Clean up on unmount only if creating new
    return () => {
      if (!owner) {
        // Don't reset if user navigated away mid-form
      }
    };
  }, [owner]);

  const handleSubmit = async () => {
    setIsSubmitting(true);
    setSubmitError(null);

    const ownerData = {
      ownerType: data.ownerType as 'individual' | 'company',
      taxId: data.taxId,
      firstName: data.firstName || undefined,
      lastName: data.lastName || undefined,
      companyName: data.companyName || undefined,
      residenceCountry: data.residenceCountry,
      residenceAddress: data.residenceAddress,
      residenceCity: data.residenceCity,
      residencePostalCode: data.residencePostalCode,
      iban: data.iban || undefined,
    };

    try {
      const result = owner
        ? await updateOwner(owner.id, ownerData)
        : await createOwner(ownerData);

      if (result.error) {
        setSubmitError(result.error);
        setIsSubmitting(false);
        return;
      }

      // Success - reset form and navigate
      reset();
      router.push('/owners');
    } catch (error) {
      setSubmitError('An unexpected error occurred');
      setIsSubmitting(false);
    }
  };

  const goToNextStep = () => {
    setStep(step + 1);
  };

  const goToPrevStep = () => {
    setStep(step - 1);
  };

  return (
    <div className="max-w-2xl mx-auto">
      <Stepper steps={steps} currentStep={step} />

      <Card>
        <CardHeader>
          <CardTitle>
            {owner ? t('editTitle') : t('addNew')}
          </CardTitle>
        </CardHeader>
        <CardContent>
          {step === 1 && (
            <Step1Form
              data={data}
              updateData={updateData}
              onNext={goToNextStep}
            />
          )}
          {step === 2 && (
            <Step2Form
              data={data}
              updateData={updateData}
              onNext={goToNextStep}
              onBack={goToPrevStep}
            />
          )}
          {step === 3 && (
            <Step3Form
              data={data}
              updateData={updateData}
              onNext={goToNextStep}
              onBack={goToPrevStep}
            />
          )}
          {step === 4 && (
            <Step4Form
              data={data}
              updateData={updateData}
              onSubmit={handleSubmit}
              onBack={goToPrevStep}
              isSubmitting={isSubmitting}
              submitError={submitError}
            />
          )}
        </CardContent>
      </Card>
    </div>
  );
}

// Common data type for step forms
interface OwnerFormData {
  ownerType: OwnerType;
  taxId: string;
  taxIdType: 'NIE' | 'NIF' | null;
  firstName: string;
  lastName: string;
  companyName: string;
  residenceCountry: string;
  residenceAddress: string;
  residenceCity: string;
  residencePostalCode: string;
  iban: string;
}

// Step 1: Owner Type Selection
interface Step1Props {
  data: OwnerFormData;
  updateData: (data: Partial<OwnerFormData>) => void;
  onNext: () => void;
}

function Step1Form({ data, updateData, onNext }: Step1Props) {
  const t = useTranslations('owner.form');
  const tActions = useTranslations('owner.actions');
  const schema = useOwnerStep1Schema();

  const form = useForm<{ ownerType: 'individual' | 'company' }>({
    resolver: zodResolver(schema),
    defaultValues: {
      ownerType: (data.ownerType as 'individual' | 'company') || undefined,
    },
  });

  const onSubmit = (values: { ownerType: 'individual' | 'company' }) => {
    updateData({ ownerType: values.ownerType });
    onNext();
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <FormField
          control={form.control}
          name="ownerType"
          render={({ field }) => (
            <FormItem>
              <FormLabel>{t('ownerType')}</FormLabel>
              <Select
                onValueChange={field.onChange}
                defaultValue={field.value}
              >
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder={t('ownerType')} />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="individual">{t('individual')}</SelectItem>
                  <SelectItem value="company">{t('company')}</SelectItem>
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="flex justify-end">
          <Button type="submit">{tActions('next')}</Button>
        </div>
      </form>
    </Form>
  );
}

// Step 2: Identity (Tax ID + Name)
interface Step2Props {
  data: OwnerFormData;
  updateData: (data: Partial<OwnerFormData>) => void;
  onNext: () => void;
  onBack: () => void;
}

function Step2Form({ data, updateData, onNext, onBack }: Step2Props) {
  const t = useTranslations('owner.form');
  const tActions = useTranslations('owner.actions');
  const schema = useOwnerStep2Schema(data.ownerType);
  const [taxIdType, setTaxIdType] = useState<'NIE' | 'NIF' | null>(data.taxIdType);

  const form = useForm({
    resolver: zodResolver(schema),
    defaultValues: {
      taxId: data.taxId,
      firstName: data.firstName,
      lastName: data.lastName,
      companyName: data.companyName,
    },
  });

  const onSubmit = (values: z.infer<typeof schema>) => {
    updateData({
      taxId: values.taxId || '',
      taxIdType,
      firstName: values.firstName || '',
      lastName: values.lastName || '',
      companyName: values.companyName || '',
    });
    onNext();
  };

  const handleTaxIdChange = (value: string, type: 'NIE' | 'NIF' | null) => {
    form.setValue('taxId', value);
    setTaxIdType(type);
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <TaxIdInput
          value={form.watch('taxId') || ''}
          onChange={handleTaxIdChange}
          error={form.formState.errors.taxId?.message}
        />

        {data.ownerType === 'individual' && (
          <>
            <FormField
              control={form.control}
              name="firstName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t('firstName')}</FormLabel>
                  <FormControl>
                    <Input {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="lastName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t('lastName')}</FormLabel>
                  <FormControl>
                    <Input {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </>
        )}

        {data.ownerType === 'company' && (
          <FormField
            control={form.control}
            name="companyName"
            render={({ field }) => (
              <FormItem>
                <FormLabel>{t('companyName')}</FormLabel>
                <FormControl>
                  <Input {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        )}

        <div className="flex justify-between">
          <Button type="button" variant="outline" onClick={onBack}>
            {tActions('back')}
          </Button>
          <Button type="submit">{tActions('next')}</Button>
        </div>
      </form>
    </Form>
  );
}

// Step 3: Fiscal Residence
interface Step3Props {
  data: OwnerFormData;
  updateData: (data: Partial<OwnerFormData>) => void;
  onNext: () => void;
  onBack: () => void;
}

function Step3Form({ data, updateData, onNext, onBack }: Step3Props) {
  const t = useTranslations('owner.form');
  const tActions = useTranslations('owner.actions');
  const schema = useOwnerStep3Schema();

  const form = useForm({
    resolver: zodResolver(schema),
    defaultValues: {
      residenceCountry: data.residenceCountry,
      residenceAddress: data.residenceAddress,
      residenceCity: data.residenceCity,
      residencePostalCode: data.residencePostalCode,
    },
  });

  const onSubmit = (values: z.infer<typeof schema>) => {
    updateData(values);
    onNext();
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <FormField
          control={form.control}
          name="residenceCountry"
          render={({ field }) => (
            <FormItem>
              <FormLabel>{t('residenceCountry')}</FormLabel>
              <FormControl>
                <Input {...field} placeholder="GB" maxLength={2} />
              </FormControl>
              <FormDescription>ISO 3166-1 alpha-2 code (e.g., GB, DE, FR)</FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="residenceAddress"
          render={({ field }) => (
            <FormItem>
              <FormLabel>{t('residenceAddress')}</FormLabel>
              <FormControl>
                <Input {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="residenceCity"
          render={({ field }) => (
            <FormItem>
              <FormLabel>{t('residenceCity')}</FormLabel>
              <FormControl>
                <Input {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="residencePostalCode"
          render={({ field }) => (
            <FormItem>
              <FormLabel>{t('residencePostalCode')}</FormLabel>
              <FormControl>
                <Input {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="flex justify-between">
          <Button type="button" variant="outline" onClick={onBack}>
            {tActions('back')}
          </Button>
          <Button type="submit">{tActions('next')}</Button>
        </div>
      </form>
    </Form>
  );
}

// Step 4: Bank Details (IBAN)
interface Step4Props {
  data: OwnerFormData;
  updateData: (data: Partial<OwnerFormData>) => void;
  onSubmit: () => void;
  onBack: () => void;
  isSubmitting: boolean;
  submitError: string | null;
}

function Step4Form({ data, updateData, onSubmit, onBack, isSubmitting, submitError }: Step4Props) {
  const t = useTranslations('owner.form');
  const tActions = useTranslations('owner.actions');
  const schema = useOwnerStep4Schema();

  const form = useForm({
    resolver: zodResolver(schema),
    defaultValues: {
      iban: data.iban,
    },
  });

  const handleSubmit = (values: z.infer<typeof schema>) => {
    updateData({ iban: values.iban || '' });
    onSubmit();
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
        <FormField
          control={form.control}
          name="iban"
          render={({ field }) => (
            <FormItem>
              <FormLabel>{t('iban')}</FormLabel>
              <FormControl>
                <Input
                  {...field}
                  placeholder="ES91 2100 0418 4502 0005 1332"
                  onChange={(e) => field.onChange(e.target.value.toUpperCase())}
                />
              </FormControl>
              <FormDescription>{t('ibanOptional')}</FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        {submitError && (
          <p className="text-destructive text-base font-medium" role="alert">
            {submitError}
          </p>
        )}

        <div className="flex justify-between">
          <Button type="button" variant="outline" onClick={onBack} disabled={isSubmitting}>
            {tActions('back')}
          </Button>
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting ? '...' : tActions('save')}
          </Button>
        </div>
      </form>
    </Form>
  );
}
