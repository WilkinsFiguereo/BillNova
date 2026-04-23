'use client';
import React, { useState } from 'react';
import { Plus, Trash2, AlertTriangle } from "lucide-react";
import { C } from '../theme/companyRegisterTheme';
import { CompanyFormData, PricingType, Service } from '../types/companyRegister.types';
import { InputField } from '../ui/InputField';

interface Props {
  formData: CompanyFormData;
  getFieldError: (f: keyof CompanyFormData) => string | undefined;
  updateField: <K extends keyof CompanyFormData>(f: K, v: CompanyFormData[K]) => void;
}

export const ServicesSection: React.FC<Props> = ({ formData, getFieldError, updateField }) => {
  const [newService, setNewService] = useState<Partial<Service>>({
    name: '',
    description: '',
    price: 0,
    pricingType: 'unique',
  });

  const error = getFieldError('services');

  const addService = () => {
    if (!newService.name?.trim()) {
      alert('El nombre del servicio es requerido');
      return;
    }
    if (!newService.price || newService.price <= 0) {
      alert('El precio debe ser mayor a 0');
      return;
    }

    const service: Service = {
      id: Date.now().toString(),
      name: newService.name.trim(),
      description: newService.description?.trim() || '',
      price: Number(newService.price),
      pricingType: newService.pricingType || 'unique',
    };

    updateField('services', [...formData.services, service]);
    setNewService({
      name: '',
      description: '',
      price: 0,
      pricingType: 'unique',
    });
  };

  const removeService = (id: string) => {
    updateField('services', formData.services.filter(s => s.id !== id));
  };

  const pricingLabels = {
    unique: 'Pago único',
    monthly: 'Mensual',
    weekly: 'Semanal',
    annual: 'Anual',
  };

  return (
    <div>
      <div style={{ textAlign:'center', marginBottom:28 }}>
        <div style={{ fontSize:48, marginBottom:10 }}>🛠️</div>
        <h2 style={{ fontSize:20, fontWeight:600, color:C.textPrimary, margin:'0 0 4px' }}>
          Agregar Servicios
        </h2>
        <p style={{ fontSize:14, color:C.textSecondary, margin:0 }}>
          Define los servicios que ofrece tu empresa
        </p>
      </div>

      {/* Lista de servicios agregados */}
      {formData.services && formData.services.length > 0 && (
        <div style={{ marginBottom:24 }}>
          <h3 style={{ fontSize:14, fontWeight:600, color:C.textPrimary, marginBottom:12 }}>
            Servicios agregados ({formData.services.length})
          </h3>
          <div style={{ display:'flex', flexDirection:'column', gap:8 }}>
            {formData.services.map(service => (
              <div
                key={service.id}
                style={{
                  display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                  backgroundColor: C.bgAlt, padding: '12px 14px',
                  borderRadius: 10, border: `1px solid ${C.borderDefault}`,
                }}
              >
                <div style={{ flex: 1 }}>
                  <p style={{ fontSize:14, fontWeight:600, color:C.textPrimary, margin:'0 0 2px' }}>
                    {service.name}
                  </p>
                  <p style={{ fontSize:12, color:C.textSecondary, margin:0 }}>
                    ${service.price.toFixed(2)} - {pricingLabels[service.pricingType]}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => removeService(service.id)}
                  style={{
                    width: 36, height: 36,
                    backgroundColor: `${C.error}15`,
                    color: C.error,
                    border: 'none',
                    borderRadius: 8,
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    marginLeft: 10,
                  }}
                >
                  <Trash2 size={16} />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Formulario para agregar nuevo servicio */}
      <div style={{
        backgroundColor: C.bgAlt,
        padding: '16px 14px',
        borderRadius: 10,
        border: `1px solid ${C.borderDefault}`,
      }}>
        <h3 style={{ fontSize:13, fontWeight:600, color:C.textPrimary, margin:'0 0 12px' }}>
          Nuevo servicio
        </h3>

        <InputField
          label="Nombre del servicio"
          placeholder="Ej. Consultoría técnica"
          value={newService.name || ''}
          onChange={e => setNewService({ ...newService, name: e.target.value })}
          required
        />

        <div style={{ marginBottom: 12 }}>
          <label style={{ display:'block', fontSize:13, fontWeight:500, color:C.textPrimary, marginBottom:6 }}>
            Descripción <span style={{ fontSize:11, color:C.textSecondary }}>(opcional)</span>
          </label>
          <textarea
            value={newService.description || ''}
            onChange={e => setNewService({ ...newService, description: e.target.value })}
            placeholder="Ej. Hasta 2 horas incluidas..."
            style={{
              width: '100%', minHeight: 80, padding: '10px 12px',
              fontSize: 14, color: C.textPrimary,
              backgroundColor: C.bgSecondary,
              border: `1.5px solid ${C.borderDefault}`,
              borderRadius: 8, outline: 'none',
              fontFamily: 'inherit',
              resize: 'vertical',
            }}
          />
        </div>

        <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:10, marginBottom:12 }}>
          <div>
            <label style={{ display:'block', fontSize:13, fontWeight:500, color:C.textPrimary, marginBottom:6 }}>
              Precio <span style={{ color:C.error }}>*</span>
            </label>
            <input
              type="number"
              min="0"
              step="0.01"
              value={newService.price || ''}
              onChange={e => setNewService({ ...newService, price: parseFloat(e.target.value) || 0 })}
              placeholder="0.00"
              style={{
                width: '100%', height: 40, padding: '0 10px',
                fontSize: 14, color: C.textPrimary,
                backgroundColor: C.bgSecondary,
                border: `1.5px solid ${C.borderDefault}`,
                borderRadius: 8, outline: 'none',
              }}
            />
          </div>

          <div>
            <label style={{ display:'block', fontSize:13, fontWeight:500, color:C.textPrimary, marginBottom:6 }}>
              Tipo de pago <span style={{ color:C.error }}>*</span>
            </label>
            <select
              value={newService.pricingType || 'unique'}
              onChange={e => setNewService({ ...newService, pricingType: e.target.value as PricingType })}
              style={{
                width: '100%', height: 40, padding: '0 10px',
                fontSize: 14, color: C.textPrimary,
                backgroundColor: C.bgSecondary,
                border: `1.5px solid ${C.borderDefault}`,
                borderRadius: 8, outline: 'none',
                cursor: 'pointer',
                appearance: 'none',
                backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='14' height='14' fill='%234B5563' viewBox='0 0 16 16'%3E%3Cpath d='M7.247 11.14L2.451 5.658C1.885 5.013 2.345 4 3.204 4h9.592a1 1 0 0 1 .753 1.659l-4.796 5.48a1 1 0 0 1-1.506 0z'/%3E%3C/svg%3E")`,
                backgroundRepeat: 'no-repeat',
                backgroundPosition: 'right 10px center',
                paddingRight: '30px',
              }}
            >
              <option value="unique">Pago único</option>
              <option value="monthly">Mensual</option>
              <option value="weekly">Semanal</option>
              <option value="annual">Anual</option>
            </select>
          </div>
        </div>

        <button
          type="button"
          onClick={addService}
          style={{
            width: '100%', height: 40,
            backgroundColor: C.brand600, color: 'white',
            fontWeight: 600, fontSize: 14,
            border: 'none', borderRadius: 8, cursor: 'pointer',
            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
            fontFamily: 'inherit',
          }}
        >
          <Plus size={16} />
          Agregar servicio
        </button>
      </div>

      {error && (
        <p style={{ fontSize:12, color:C.error, display:'flex', alignItems:'center', gap:6, margin:'12px 0 0' }}>
          <AlertTriangle size={14} />
          {error}
        </p>
      )}
    </div>
  );
};
