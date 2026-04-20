'use client';
import React, { useEffect, useState } from 'react';
import { Globe, Mail, PartyPopper } from "lucide-react";
import { Sidebar } from "../dashboard/dashboards";
import { NAV_ITEMS } from "../dashboard/data/chart.data";
import { dashboardTheme, globalStyles } from "../dashboard/theme/dashboard.theme";
import { FORM_STEPS }         from './data/companyRegisterData';
import { useCompanyRegister } from './hooks/useCompanyRegister';
import { C }                  from './theme/companyRegisterTheme';
import { StepIndicator }      from './ui/StepIndicator';
import { CompanyInfoSection } from './sections/CompanyInfoSection';
import { ContactSection }     from './sections/ContactSection';
import { AddressSection }     from './sections/AddressSection';
import { AccountSection }     from './sections/AccountSection';
// import { BusinessTypeSection } from './sections/BusinessTypeSection';
// import { ServicesSection }     from './sections/ServicesSection';

export default function CompanyRegisterPage() {
  const [hasCompany, setHasCompany] = useState(false);

  useEffect(() => {
    try {
      const existing =
        sessionStorage.getItem('billnova_company_id') ??
        localStorage.getItem('billnova_company_id'); // fallback para migración
      if (existing) setHasCompany(true);
    } catch {}
  }, []);

  const {
    currentStep, totalSteps, formData, formStatus,
    showPassword, showConfirm, progressPercent, passwordStrength,
    updateField, getFieldError,
    goNext, goBack, handleSubmit,
    toggleShowPassword, toggleShowConfirm,
  } = useCompanyRegister();

  const font = "'DM Sans', 'Segoe UI', sans-serif";

  /* ── Already Has Company ────────────────────────────────────────── */
  if (hasCompany) {
    return (
      <div style={{ display:'flex', minHeight:'100vh', backgroundColor:C.bgPrimary, fontFamily:font }}>
        <style>{globalStyles(dashboardTheme)}</style>
        <Sidebar navItems={NAV_ITEMS} />
        <main style={{ flex:1, display:'flex', alignItems:'center', justifyContent:'center', padding:16 }}>
          <div style={{
            backgroundColor:C.bgSecondary, borderRadius:20, padding:'40px 36px',
            maxWidth:520, width:'100%', textAlign:'center',
            boxShadow:'0 4px 32px rgba(30,58,138,0.1)',
          }}>
            <h1 style={{ fontSize:24, fontWeight:700, color:C.textPrimary, margin:'0 0 8px' }}>
              Ya tienes una empresa registrada
            </h1>
            <p style={{ fontSize:14, color:C.textSecondary, lineHeight:'22px', margin:'0 0 24px' }}>
              Este apartado solo permite registrar una empresa por cuenta.
            </p>
            <a href="/navigation/seller/company_config/page" style={{
              display:'inline-block', width:'100%', height:52, lineHeight:'52px',
              backgroundColor:C.brand600, color:C.white, fontWeight:700, fontSize:15,
              border:'none', borderRadius:10, textDecoration:'none',
              fontFamily:font,
            }}>
              Ir a configuración de empresa →
            </a>
          </div>
        </main>
      </div>
    );
  }

  /* ── Success ────────────────────────────────────────────────────── */
  if (formStatus === 'success') {
    return (
      <div style={{ display:'flex', minHeight:'100vh', backgroundColor:C.bgPrimary, fontFamily:font }}>
        <style>{globalStyles(dashboardTheme)}</style>
        <Sidebar navItems={NAV_ITEMS} />
        <main style={{ flex:1, display:'flex', alignItems:'center', justifyContent:'center', padding:16 }}>
          <div style={{
            backgroundColor:C.bgSecondary, borderRadius:20, padding:'48px 40px',
            maxWidth:460, width:'100%', textAlign:'center',
            boxShadow:'0 4px 32px rgba(30,58,138,0.1)',
          }}>
          <div style={{
            width:96, height:96, borderRadius:'50%', backgroundColor:C.successBg,
            display:'flex', alignItems:'center', justifyContent:'center',
            margin:'0 auto 24px', fontSize:44,
          }}><PartyPopper size={44} color={C.success} /></div>

          <h1 style={{ fontSize:26, fontWeight:700, color:C.textPrimary, margin:'0 0 8px' }}>
            ¡Empresa Registrada!
          </h1>
          <p style={{ fontSize:14, color:C.textSecondary, lineHeight:'22px', margin:'0 0 24px' }}>
            Tu cuenta empresarial fue creada correctamente.<br />
            Revisa tu correo para verificarla.
          </p>

          <div style={{
            display:'inline-block', backgroundColor:C.successBg, color:C.success,
            fontWeight:600, fontSize:15, borderRadius:9999, padding:'8px 24px', marginBottom:16,
          }}>
            ✓  {formData.companyName}
          </div>

          <div style={{
            backgroundColor:C.bgAlt, borderRadius:10, padding:'14px 16px',
            textAlign:'left', marginBottom:32,
          }}>
            <p style={{ fontSize:13, color:C.textSecondary, margin:'0 0 4px', display:'flex', alignItems:'center', gap:6 }}>
              <Mail size={14} />
              {formData.adminEmail}
            </p>
            <p style={{ fontSize:13, color:C.textSecondary, margin:0, display:'flex', alignItems:'center', gap:6 }}>
              <Globe size={14} />
              {formData.country}
            </p>
          </div>

          <button style={{
            width:'100%', height:52, backgroundColor:C.brand600, color:C.white,
            fontWeight:700, fontSize:15, border:'none', borderRadius:10, cursor:'pointer',
            fontFamily:font,
          }}>
            Ir al Dashboard →
          </button>
        </div>
        </main>
      </div>
    );
  }

  /* ── Sections ───────────────────────────────────────────────────── */
  const sharedProps = { formData, getFieldError, updateField };
  const renderSection = () => {
    switch (currentStep) {
      case 1: return <CompanyInfoSection {...sharedProps} />;
      case 2: return <ContactSection     {...sharedProps} />;
      case 3: return <AddressSection     {...sharedProps} />;
      case 4: return (
        <AccountSection
          {...sharedProps}
          showPassword={showPassword} showConfirm={showConfirm}
          toggleShowPassword={toggleShowPassword} toggleShowConfirm={toggleShowConfirm}
          passwordStrength={passwordStrength}
        />
      );
      case 5: return <BusinessTypeSection {...sharedProps} />;
      case 6: return formData.businessType === 'services' 
        ? <ServicesSection {...sharedProps} />
        : <div style={{ textAlign:'center', padding:'40px 0' }}>
            <div style={{ fontSize:48, marginBottom:20 }}>📦</div>
            <h2 style={{ fontSize:20, fontWeight:600, color:C.textPrimary, margin:'0 0 8px' }}>
              Listo para vender productos
            </h2>
            <p style={{ fontSize:14, color:C.textSecondary, marginBottom:24 }}>
              Podrás agregar tus productos desde el dashboard
            </p>
            <div style={{
              display:'inline-block', backgroundColor:C.successBg, color:C.success,
              fontWeight:600, fontSize:14, borderRadius:9999, padding:'8px 20px',
            }}>
              ✓ Productos habilitado
            </div>
          </div>;
    }
  };

  const isLast    = currentStep === totalSteps;
  const isLoading = formStatus === 'loading';

  return (
    <div style={{ display:'flex', minHeight:'100vh', backgroundColor:C.bgPrimary, fontFamily:font }}>
      <style>{globalStyles(dashboardTheme)}</style>
      <Sidebar navItems={NAV_ITEMS} />
      <main style={{ flex:1, display:'flex', flexDirection:'column' }}>

      {/* ── Header ─────────────────────────────────────────────── */}
      <header style={{
        backgroundColor:C.bgSecondary, borderBottom:`1px solid ${C.borderDefault}`,
        padding:'14px 24px', display:'flex', alignItems:'center', justifyContent:'space-between',
      }}>
        <div>
          <div style={{ display:'flex', alignItems:'center', gap:8, marginBottom:2 }}>
            <div style={{ width:10, height:10, borderRadius:'50%', backgroundColor:C.brand600 }} />
            <span style={{ fontSize:15, fontWeight:700, color:C.brand600 }}>FinanzApp</span>
          </div>
          <span style={{ fontSize:12, color:C.textDisabled }}>Registro de Empresa</span>
        </div>
        <span style={{ fontSize:13, color:C.textSecondary }}>
          Crea tu empresa para continuar
        </span>
      </header>

      {/* ── Main ───────────────────────────────────────────────── */}
      <div style={{
        flex:1, display:'flex', alignItems:'flex-start',
        justifyContent:'center', padding:'32px 16px',
      }}>
        <div style={{ width:'100%', maxWidth:520 }}>

          {/* Card */}
          <div style={{
            backgroundColor:C.bgSecondary, borderRadius:16,
            boxShadow:'0 4px 24px rgba(30,58,138,0.08)', overflow:'hidden',
          }}>
            <StepIndicator steps={FORM_STEPS} currentStep={currentStep} progressPercent={progressPercent} />

            {/* Form body */}
            <div style={{ padding:32 }}>
              {renderSection()}
            </div>

            {/* Footer nav */}
            <div style={{
              display:'flex', gap:12,
              padding:'0 32px 32px',
            }}>
              {currentStep > 1 && (
                <button
                  type="button"
                  onClick={goBack}
                  style={{
                    flex:1, height:52, backgroundColor:'transparent',
                    color:C.textSecondary, fontWeight:600, fontSize:15,
                    border:`1.5px solid ${C.borderDefault}`, borderRadius:10,
                    cursor:'pointer', fontFamily:font,
                  }}
                >
                  ← Atrás
                </button>
              )}
              <button
                type="button"
                onClick={isLast ? handleSubmit : goNext}
                disabled={isLoading}
                style={{
                  flex: currentStep === 1 ? undefined : 2,
                  width: currentStep === 1 ? '100%' : undefined,
                  height:52, backgroundColor: isLoading ? '#6B8FCC' : C.brand600,
                  color:C.white, fontWeight:700, fontSize:15,
                  border:'none', borderRadius:10, cursor: isLoading ? 'not-allowed' : 'pointer',
                  boxShadow:'0 5px 16px rgba(30,58,138,0.28)',
                  display:'flex', alignItems:'center', justifyContent:'center', gap:8,
                  fontFamily:font, transition:'background 0.15s',
                }}
              >
                {isLoading ? (
                  <>
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" style={{ animation:'spin 0.8s linear infinite' }}>
                      <circle cx="12" cy="12" r="10" stroke="white" strokeWidth="4" opacity="0.25"/>
                      <path d="M4 12a8 8 0 018-8" stroke="white" strokeWidth="4" strokeLinecap="round"/>
                    </svg>
                    Creando empresa…
                    <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
                  </>
                ) : isLast ? 'Crear Empresa  ✓' : 'Continuar  →'}
              </button>
            </div>
          </div>

          {/* Bottom link */}
          <p style={{ textAlign:'center', fontSize:13, color:C.textSecondary, marginTop:20 }}>
            ¿Necesitas ayuda?{' '}
            <a href="#" style={{ color:C.brand400, fontWeight:600, textDecoration:'none' }}>
              Contáctanos
            </a>
          </p>
        </div>
      </div>
      </main>
    </div>
  );
}
