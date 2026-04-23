'use client';
import React from 'react';
import { Package, Wrench, AlertTriangle } from "lucide-react";
import { C } from '../theme/companyRegisterTheme';
import { CompanyFormData } from '../types/companyRegister.types';

interface Props {
  formData: CompanyFormData;
  getFieldError: (f: keyof CompanyFormData) => string | undefined;
  updateField: <K extends keyof CompanyFormData>(f: K, v: CompanyFormData[K]) => void;
}

export const BusinessTypeSection: React.FC<Props> = ({ formData, getFieldError, updateField }) => {
  const error = getFieldError('businessType');
  const businessType = formData.businessType;

  return (
    <div>
      <div style={{ textAlign:'center', marginBottom:28 }}>
        <div style={{ fontSize:48, marginBottom:10 }}>🏪</div>
        <h2 style={{ fontSize:20, fontWeight:600, color:C.textPrimary, margin:'0 0 4px' }}>
          Tipo de Negocio
        </h2>
        <p style={{ fontSize:14, color:C.textSecondary, margin:0 }}>
          ¿Qué vendes en tu empresa?
        </p>
      </div>

      <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:12, marginBottom:16 }}>
        <button
          type="button"
          onClick={() => updateField('businessType', 'products' as const)}
          style={{
            display: 'flex', flexDirection: 'column', alignItems: 'center',
            padding: '24px 16px',
            border: `2px solid ${businessType === 'products' ? C.brand600 : C.borderDefault}`,
            backgroundColor: businessType === 'products' ? `${C.brand600}10` : 'transparent',
            borderRadius: 12, cursor: 'pointer',
            transition: 'all 0.2s',
            textAlign: 'center',
          }}
          onMouseEnter={(e) => {
            if (businessType !== 'products') {
              (e.currentTarget as HTMLElement).style.borderColor = C.brand400;
              (e.currentTarget as HTMLElement).style.backgroundColor = `${C.brand400}08`;
            }
          }}
          onMouseLeave={(e) => {
            if (businessType !== 'products') {
              (e.currentTarget as HTMLElement).style.borderColor = C.borderDefault;
              (e.currentTarget as HTMLElement).style.backgroundColor = 'transparent';
            }
          }}
        >
          <Package 
            size={40} 
            color={businessType === 'products' ? C.brand600 : C.textSecondary}
            style={{ marginBottom:12 }}
          />
          <span style={{ fontSize:16, fontWeight:600, color:C.textPrimary }}>Productos</span>
          <span style={{ fontSize:12, color:C.textSecondary, marginTop:4 }}>
            Vendo artículos físicos o digitales
          </span>
        </button>

        <button
          type="button"
          onClick={() => updateField('businessType', 'services' as const)}
          style={{
            display: 'flex', flexDirection: 'column', alignItems: 'center',
            padding: '24px 16px',
            border: `2px solid ${businessType === 'services' ? C.brand600 : C.borderDefault}`,
            backgroundColor: businessType === 'services' ? `${C.brand600}10` : 'transparent',
            borderRadius: 12, cursor: 'pointer',
            transition: 'all 0.2s',
            textAlign: 'center',
          }}
          onMouseEnter={(e) => {
            if (businessType !== 'services') {
              (e.currentTarget as HTMLElement).style.borderColor = C.brand400;
              (e.currentTarget as HTMLElement).style.backgroundColor = `${C.brand400}08`;
            }
          }}
          onMouseLeave={(e) => {
            if (businessType !== 'services') {
              (e.currentTarget as HTMLElement).style.borderColor = C.borderDefault;
              (e.currentTarget as HTMLElement).style.backgroundColor = 'transparent';
            }
          }}
        >
          <Wrench 
            size={40} 
            color={businessType === 'services' ? C.brand600 : C.textSecondary}
            style={{ marginBottom:12 }}
          />
          <span style={{ fontSize:16, fontWeight:600, color:C.textPrimary }}>Servicios</span>
          <span style={{ fontSize:12, color:C.textSecondary, marginTop:4 }}>
            Ofrezco servicios y profesionalismo
          </span>
        </button>
      </div>

      {error && (
        <p style={{ fontSize:12, color:C.error, display:'flex', alignItems:'center', gap:6, margin:0 }}>
          <AlertTriangle size={14} />
          {error}
        </p>
      )}
    </div>
  );
};
