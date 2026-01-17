'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
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
import { AddressFields } from '@/components/properties/address-fields';
import { CadastralInput } from '@/components/properties/cadastral-input';
import { IbiHelper, IbiHelperInline } from '@/components/properties/ibi-helper';
import { OwnershipTable } from '@/components/properties/ownership-table';

import { usePropertyFormStore, type OwnershipAssignment } from '@/stores/property-form';
import {
  usePropertyAddressSchema,
  usePropertyCadastralSchema,
  usePropertyOwnershipSchema,
} from '@/hooks/usePropertySchemas';
import { createProperty, updateProperty } from '@/app/[locale]/(protected)/properties/actions';
import type { Property, Owner } from '@/db/schema';

interface PropertyFormProps {
  property?: Property & { owners?: { ownerId: string; ownershipPercentage: string }[] };
  availableOwners: Owner[];
}

/**
 * PropertyForm Component
 * Multi-step wizard for creating/editing properties
 * A11Y-01: 18px+ text throughout
 * A11Y-02: 48px touch targets
 * A11Y-05: Clear validation feedback
 */
export function PropertyForm({ property, availableOwners }: PropertyFormProps) {
  const t = useTranslations('property');
  const tCommon = useTranslations('common');
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [showIbiHelper, setShowIbiHelper] = useState(false);

  const { step, data, setStep, updateData, setOwners, addOwner, removeOwner, updateOwnerPercentage, reset, setEditingId } =
    usePropertyFormStore();

  // Step labels for stepper
  const steps = [t('steps.address'), t('steps.cadastral'), t('steps.owners')];

  // Initialize form with existing property data if editing
  useEffect(() => {
    if (property) {
      setEditingId(property.id);
      updateData({
        streetType: property.streetType,
        streetName: property.streetName,
        streetNumber: property.streetNumber,
        floor: property.floor || '',
        door: property.door || '',
        staircase: property.staircase || '',
        block: property.block || '',
        city: property.city,
        province: property.province,
        postalCode: property.postalCode,
        cadastralReference: property.cadastralReference,
        cadastralValue: property.cadastralValue,
        collectiveRevision: property.collectiveRevision || false,
        revisionYear: property.revisionYear?.toString() || '',
      });
      // Set owners from property data
      if (property.owners) {
        setOwners(
          property.owners.map((o) => ({
            ownerId: o.ownerId,
            percentage: parseFloat(o.ownershipPercentage),
          }))
        );
      }
    }
  }, [property]);

  const handleSubmit = async () => {
    setIsSubmitting(true);
    setSubmitError(null);

    const propertyData = {
      streetType: data.streetType,
      streetName: data.streetName,
      streetNumber: data.streetNumber,
      floor: data.floor || undefined,
      door: data.door || undefined,
      staircase: data.staircase || undefined,
      block: data.block || undefined,
      city: data.city,
      province: data.province,
      postalCode: data.postalCode,
      cadastralReference: data.cadastralReference,
      cadastralValue: data.cadastralValue,
      collectiveRevision: data.collectiveRevision,
      revisionYear: data.revisionYear || undefined,
      owners: data.owners,
    };

    try {
      const result = property
        ? await updateProperty(property.id, propertyData)
        : await createProperty(propertyData);

      if (result.error) {
        setSubmitError(result.error);
        setIsSubmitting(false);
        return;
      }

      // Success - reset form and navigate
      reset();
      router.push('/properties');
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

  // Handle adding owner from dropdown
  const handleAddOwner = (ownerId: string) => {
    addOwner({ ownerId, percentage: 0 });
  };

  return (
    <div className="max-w-2xl mx-auto">
      <Stepper steps={steps} currentStep={step} />

      <Card>
        <CardHeader>
          <CardTitle>{property ? t('editTitle') : t('addNew')}</CardTitle>
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
              onShowIbiHelper={() => setShowIbiHelper(true)}
            />
          )}
          {step === 3 && (
            <Step3Form
              data={data}
              owners={data.owners}
              availableOwners={availableOwners}
              onAddOwner={handleAddOwner}
              onRemoveOwner={removeOwner}
              onUpdatePercentage={updateOwnerPercentage}
              onSubmit={handleSubmit}
              onBack={goToPrevStep}
              isSubmitting={isSubmitting}
              submitError={submitError}
            />
          )}
        </CardContent>
      </Card>

      <IbiHelper isOpen={showIbiHelper} onClose={() => setShowIbiHelper(false)} />
    </div>
  );
}

// Step 1: Address
interface Step1Props {
  data: {
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
  };
  updateData: (data: Partial<Step1Props['data']>) => void;
  onNext: () => void;
}

function Step1Form({ data, updateData, onNext }: Step1Props) {
  const t = useTranslations('property.actions');
  const schema = usePropertyAddressSchema();

  const form = useForm({
    resolver: zodResolver(schema),
    defaultValues: {
      streetType: data.streetType,
      streetName: data.streetName,
      streetNumber: data.streetNumber,
      floor: data.floor || '',
      door: data.door || '',
      staircase: data.staircase || '',
      block: data.block || '',
      city: data.city,
      province: data.province,
      postalCode: data.postalCode,
    },
  });

  const onSubmit = (values: z.infer<typeof schema>) => {
    updateData({
      streetType: values.streetType,
      streetName: values.streetName,
      streetNumber: values.streetNumber,
      floor: values.floor || '',
      door: values.door || '',
      staircase: values.staircase || '',
      block: values.block || '',
      city: values.city,
      province: values.province,
      postalCode: values.postalCode,
    });
    onNext();
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <AddressFields form={form} />

        <div className="flex justify-end">
          <Button type="submit">{t('next')}</Button>
        </div>
      </form>
    </Form>
  );
}

// Step 2: Cadastral Data
interface Step2Props {
  data: {
    cadastralReference: string;
    cadastralValue: string;
    collectiveRevision: boolean;
    revisionYear: string;
  };
  updateData: (data: Partial<Step2Props['data']>) => void;
  onNext: () => void;
  onBack: () => void;
  onShowIbiHelper: () => void;
}

function Step2Form({ data, updateData, onNext, onBack, onShowIbiHelper }: Step2Props) {
  const t = useTranslations('property.form');
  const tActions = useTranslations('property.actions');
  const schema = usePropertyCadastralSchema();

  const form = useForm({
    resolver: zodResolver(schema),
    defaultValues: {
      cadastralReference: data.cadastralReference,
      cadastralValue: data.cadastralValue,
      collectiveRevision: data.collectiveRevision,
      revisionYear: data.revisionYear,
    },
  });

  const onSubmit = (values: z.infer<typeof schema>) => {
    updateData({
      cadastralReference: values.cadastralReference,
      cadastralValue: values.cadastralValue,
      collectiveRevision: values.collectiveRevision,
      revisionYear: values.revisionYear || '',
    });
    onNext();
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        {/* Cadastral Reference */}
        <FormField
          control={form.control}
          name="cadastralReference"
          render={({ field }) => (
            <FormItem>
              <CadastralInput
                value={field.value}
                onChange={field.onChange}
                error={form.formState.errors.cadastralReference?.message}
                onHelpClick={onShowIbiHelper}
              />
            </FormItem>
          )}
        />

        {/* Cadastral Value */}
        <FormField
          control={form.control}
          name="cadastralValue"
          render={({ field }) => (
            <FormItem>
              <FormLabel>{t('cadastralValue')}</FormLabel>
              <FormControl>
                <div className="relative">
                  <Input
                    {...field}
                    type="number"
                    step="0.01"
                    min="0"
                    placeholder="150000.00"
                    className="pr-8"
                  />
                  <span className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                    EUR
                  </span>
                </div>
              </FormControl>
              <FormDescription>{t('cadastralValueHint')}</FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Collective Revision Checkbox */}
        <FormField
          control={form.control}
          name="collectiveRevision"
          render={({ field }) => (
            <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
              <FormControl>
                <Checkbox
                  checked={field.value}
                  onCheckedChange={field.onChange}
                />
              </FormControl>
              <div className="space-y-1 leading-none">
                <FormLabel>{t('collectiveRevision')}</FormLabel>
                <FormDescription>
                  1.1% vs 2% cadastral rate
                </FormDescription>
              </div>
            </FormItem>
          )}
        />

        {/* Revision Year (shown when collective revision is checked) */}
        {form.watch('collectiveRevision') && (
          <FormField
            control={form.control}
            name="revisionYear"
            render={({ field }) => (
              <FormItem>
                <FormLabel>{t('revisionYear')}</FormLabel>
                <FormControl>
                  <Input
                    {...field}
                    type="number"
                    min="1990"
                    max={new Date().getFullYear()}
                    placeholder="2020"
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        )}

        {/* IBI Helper inline */}
        <IbiHelperInline />

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

// Step 3: Ownership Assignment
interface Step3Props {
  data: { owners: OwnershipAssignment[] };
  owners: OwnershipAssignment[];
  availableOwners: Owner[];
  onAddOwner: (ownerId: string) => void;
  onRemoveOwner: (ownerId: string) => void;
  onUpdatePercentage: (ownerId: string, percentage: number) => void;
  onSubmit: () => void;
  onBack: () => void;
  isSubmitting: boolean;
  submitError: string | null;
}

function Step3Form({
  owners,
  availableOwners,
  onAddOwner,
  onRemoveOwner,
  onUpdatePercentage,
  onSubmit,
  onBack,
  isSubmitting,
  submitError,
}: Step3Props) {
  const t = useTranslations('property.actions');
  const tErrors = useTranslations('property.errors');
  const schema = usePropertyOwnershipSchema();

  const [validationError, setValidationError] = useState<string | null>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // Validate ownership
    const result = schema.safeParse({ owners });
    if (!result.success) {
      const issues = result.error.issues;
      setValidationError(issues[0]?.message || tErrors('percentageNot100'));
      return;
    }

    setValidationError(null);
    onSubmit();
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <OwnershipTable
        owners={owners}
        availableOwners={availableOwners}
        onAddOwner={onAddOwner}
        onRemoveOwner={onRemoveOwner}
        onUpdatePercentage={onUpdatePercentage}
        error={validationError || undefined}
      />

      {submitError && (
        <p className="text-destructive text-base font-medium" role="alert">
          {submitError}
        </p>
      )}

      <div className="flex justify-between">
        <Button type="button" variant="outline" onClick={onBack} disabled={isSubmitting}>
          {t('back')}
        </Button>
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? '...' : t('save')}
        </Button>
      </div>
    </form>
  );
}
