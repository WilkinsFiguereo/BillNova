'use client';

import { useState, useCallback, useMemo } from 'react';
import { INITIAL_FORM_DATA } from '../data/companyRegisterData';
import { CompanyFormData, CompanyRegisterResponse, FieldError, FormStatus, PasswordStrength } from '../types/companyRegister.types';
import { C } from '../theme/companyRegisterTheme';
import { odooPost } from '@/lib/odooApi';
import { syncBusinessTypeWithCurrentUser, syncCompanyIdWithCurrentUser } from '@/features/seller/shared/companySession';

const TOTAL_STEPS = 6;

export const calcPasswordStrength = (pw: string): PasswordStrength => {
  if (!pw) return { score: 0, label: '', color: C.borderDefault, percent: 0 };

  let score = 0;
  if (pw.length >= 8) score++;
  if (/[A-Z]/.test(pw)) score++;
  if (/[0-9]/.test(pw)) score++;
  if (/[^A-Za-z0-9]/.test(pw)) score++;

  const map: PasswordStrength[] = [
    { score: 1, label: 'Muy débil', color: C.error, percent: 25 },
    { score: 2, label: 'Débil', color: C.warning, percent: 50 },
    { score: 3, label: 'Buena', color: C.brand400, percent: 75 },
    { score: 4, label: 'Fuerte', color: C.success, percent: 100 },
  ];

  return map[score - 1] ?? map[0];
};

export const useCompanyRegister = () => {
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState<CompanyFormData>(() => {
    const initial = { ...INITIAL_FORM_DATA };
    if (!Array.isArray(initial.services)) initial.services = [];
    return initial;
  });
  const [errors, setErrors] = useState<FieldError[]>([]);
  const [formStatus, setFormStatus] = useState<FormStatus>('idle');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const updateField = useCallback(<K extends keyof CompanyFormData>(field: K, value: CompanyFormData[K]) => {
    setFormData((prev) => {
      const updated = { ...prev, [field]: value };
      if (!Array.isArray(updated.services)) updated.services = [];
      return updated;
    });
    setErrors((prev) => prev.filter((error) => error.field !== field));
  }, []);

  const getFieldError = useCallback(
    (field: keyof CompanyFormData) => errors.find((error) => error.field === field)?.message,
    [errors],
  );

  const validateStep = useCallback((step: number): boolean => {
    const nextErrors: FieldError[] = [];

    if (step === 1) {
      if (!formData.companyName.trim()) nextErrors.push({ field: 'companyName', message: 'Nombre de empresa requerido' });
      if (!formData.taxId.trim()) nextErrors.push({ field: 'taxId', message: 'RUC / NIT requerido' });
      if (!formData.industryType) nextErrors.push({ field: 'industryType', message: 'Selecciona un sector' });
      if (!formData.companySize) nextErrors.push({ field: 'companySize', message: 'Selecciona el tamaño' });
    }

    if (step === 2) {
      if (!formData.adminFullName.trim()) nextErrors.push({ field: 'adminFullName', message: 'Nombre completo requerido' });
      if (!formData.adminEmail.trim()) {
        nextErrors.push({ field: 'adminEmail', message: 'Email requerido' });
      } else if (!/\S+@\S+\.\S+/.test(formData.adminEmail)) {
        nextErrors.push({ field: 'adminEmail', message: 'Formato de email inválido' });
      }
      if (!formData.adminPhone.trim()) nextErrors.push({ field: 'adminPhone', message: 'Teléfono requerido' });
    }

    if (step === 3) {
      if (!formData.country) nextErrors.push({ field: 'country', message: 'País requerido' });
      if (!formData.city.trim()) nextErrors.push({ field: 'city', message: 'Ciudad requerida' });
      if (!formData.address.trim()) nextErrors.push({ field: 'address', message: 'Dirección requerida' });
    }

    if (step === 4) {
      if (!formData.password) {
        nextErrors.push({ field: 'password', message: 'Contraseña requerida' });
      } else if (formData.password.length < 8) {
        nextErrors.push({ field: 'password', message: 'Mínimo 8 caracteres' });
      }

      if (formData.password !== formData.confirmPassword) {
        nextErrors.push({ field: 'confirmPassword', message: 'Las contraseñas no coinciden' });
      }

      if (!formData.acceptTerms) {
        nextErrors.push({ field: 'acceptTerms', message: 'Debes aceptar los términos' });
      }
    }

    if (step === 5 && !formData.businessType) {
      nextErrors.push({ field: 'businessType', message: 'Selecciona el tipo de negocio' });
    }

    if (step === 6 && formData.businessType === 'services' && (!Array.isArray(formData.services) || formData.services.length === 0)) {
      nextErrors.push({ field: 'services', message: 'Debes agregar al menos un servicio' });
    }

    setErrors(nextErrors);
    return nextErrors.length === 0;
  }, [formData]);

  const goNext = useCallback(() => {
    if (!validateStep(currentStep)) return;
    setCurrentStep((step) => Math.min(step + 1, TOTAL_STEPS));
  }, [currentStep, validateStep]);

  const goBack = useCallback(() => {
    setErrors([]);
    setCurrentStep((step) => Math.max(step - 1, 1));
  }, []);

  const handleSubmit = useCallback(async () => {
    if (!validateStep(TOTAL_STEPS)) return;

    setFormStatus('loading');

    try {
      const payload = {
        companyName: formData.companyName.trim(),
        taxId: formData.taxId.trim(),
        industryType: formData.industryType,
        companySize: formData.companySize,
        foundedYear: formData.foundedYear.trim(),
        website: formData.website.trim(),
        adminFullName: formData.adminFullName.trim(),
        adminEmail: formData.adminEmail.trim().toLowerCase(),
        adminPhone: formData.adminPhone.trim(),
        adminPosition: formData.adminPosition.trim(),
        country: formData.country,
        state: formData.state.trim(),
        city: formData.city.trim(),
        address: formData.address.trim(),
        postalCode: formData.postalCode.trim(),
        password: formData.password,
        acceptTerms: formData.acceptTerms,
        acceptMarketing: formData.acceptMarketing,
        businessType: formData.businessType,
        services: Array.isArray(formData.services) ? formData.services : [],
      };

      const res = await odooPost<CompanyRegisterResponse>(
        '/api/company/register',
        payload,
        { allowedStatuses: [400, 409] },
      );

      if (!res.ok) {
        setFormStatus('error');
        return;
      }

      if (res.company_id) {
        syncCompanyIdWithCurrentUser(res.company_id);
        syncBusinessTypeWithCurrentUser(formData.businessType || null);
      }

      setFormStatus('success');
    } catch {
      setFormStatus('error');
    }
  }, [formData, validateStep]);

  const progressPercent = useMemo(() => ((currentStep - 1) / (TOTAL_STEPS - 1)) * 100, [currentStep]);
  const passwordStrength = useMemo(() => calcPasswordStrength(formData.password), [formData.password]);

  return {
    currentStep,
    totalSteps: TOTAL_STEPS,
    formData,
    errors,
    formStatus,
    showPassword,
    showConfirm,
    progressPercent,
    passwordStrength,
    updateField,
    getFieldError,
    goNext,
    goBack,
    handleSubmit,
    toggleShowPassword: () => setShowPassword((value) => !value),
    toggleShowConfirm: () => setShowConfirm((value) => !value),
  };
};
