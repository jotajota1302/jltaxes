'use client';

import { useTranslations } from 'next-intl';
import { UseFormReturn } from 'react-hook-form';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';

// Spanish street types from schema enum
const STREET_TYPES = [
  'calle',
  'avenida',
  'plaza',
  'paseo',
  'carretera',
  'camino',
  'travesia',
  'urbanizacion',
  'otro',
] as const;

interface AddressFieldsProps {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  form: UseFormReturn<any>;
}

/**
 * AddressFields Component
 * Renders Spanish address input fields for property forms
 * A11Y-01: 18px+ text
 * A11Y-02: 48px touch targets
 */
export function AddressFields({ form }: AddressFieldsProps) {
  const t = useTranslations('property.form');
  const tStreetTypes = useTranslations('property.streetTypes');

  return (
    <div className="space-y-6">
      {/* Street Type Select */}
      <FormField
        control={form.control}
        name="streetType"
        render={({ field }) => (
          <FormItem>
            <FormLabel>{t('streetType')}</FormLabel>
            <Select onValueChange={field.onChange} defaultValue={field.value}>
              <FormControl>
                <SelectTrigger>
                  <SelectValue placeholder={t('selectStreetType')} />
                </SelectTrigger>
              </FormControl>
              <SelectContent>
                {STREET_TYPES.map((type) => (
                  <SelectItem key={type} value={type}>
                    {tStreetTypes(type)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <FormMessage />
          </FormItem>
        )}
      />

      {/* Street Name and Number Row */}
      <div className="grid gap-4 md:grid-cols-3">
        <FormField
          control={form.control}
          name="streetName"
          render={({ field }) => (
            <FormItem className="md:col-span-2">
              <FormLabel>{t('streetName')}</FormLabel>
              <FormControl>
                <Input {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="streetNumber"
          render={({ field }) => (
            <FormItem>
              <FormLabel>{t('streetNumber')}</FormLabel>
              <FormControl>
                <Input {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      </div>

      {/* Building Details Row (optional) */}
      <div className="grid gap-4 md:grid-cols-4">
        <FormField
          control={form.control}
          name="floor"
          render={({ field }) => (
            <FormItem>
              <FormLabel>{t('floor')}</FormLabel>
              <FormControl>
                <Input {...field} placeholder="1" />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="door"
          render={({ field }) => (
            <FormItem>
              <FormLabel>{t('door')}</FormLabel>
              <FormControl>
                <Input {...field} placeholder="A" />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="staircase"
          render={({ field }) => (
            <FormItem>
              <FormLabel>{t('staircase')}</FormLabel>
              <FormControl>
                <Input {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="block"
          render={({ field }) => (
            <FormItem>
              <FormLabel>{t('block')}</FormLabel>
              <FormControl>
                <Input {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      </div>

      {/* City, Province, Postal Code Row */}
      <div className="grid gap-4 md:grid-cols-3">
        <FormField
          control={form.control}
          name="city"
          render={({ field }) => (
            <FormItem>
              <FormLabel>{t('city')}</FormLabel>
              <FormControl>
                <Input {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="province"
          render={({ field }) => (
            <FormItem>
              <FormLabel>{t('province')}</FormLabel>
              <FormControl>
                <Input {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="postalCode"
          render={({ field }) => (
            <FormItem>
              <FormLabel>{t('postalCode')}</FormLabel>
              <FormControl>
                <Input {...field} maxLength={5} placeholder="28001" />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      </div>
    </div>
  );
}
