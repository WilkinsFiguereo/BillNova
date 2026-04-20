"use client";

import React, { useCallback, useMemo } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { getStoredAuthState } from "@/features/auth/login";

function safeInternalPath(raw: string | null) {
  if (!raw) return "";
  const val = raw.trim();
  if (!val.startsWith("/navigation/")) return "";
  return val;
}

function getFallbackConfigHref(from: string) {
  if (from === "admin") return "/navigation/admin/configuracion/page";
  if (from === "moderation") return "/navigation/moderation/config/page";
  if (from === "seller") return "/navigation/seller/company_config/page";

  const user = getStoredAuthState();
  const role = user?.role ?? null;
  if (role === "admin") return "/navigation/admin/configuracion/page";
  if (role === "moderation") return "/navigation/moderation/config/page";
  return "/navigation/seller/company_config/page";
}

export default function TermsPage() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const from = (searchParams.get("from") ?? "").toLowerCase();
  const returnTo = safeInternalPath(searchParams.get("returnTo"));

  const fallbackHref = useMemo(() => returnTo || getFallbackConfigHref(from), [from, returnTo]);

  const onBack = useCallback(() => {
    if (typeof window !== "undefined" && window.history.length > 1) {
      router.back();
      return;
    }
    router.push(fallbackHref);
  }, [fallbackHref, router]);

  return (
    <main
      style={{
        minHeight: "100vh",
        background: "var(--bg-main)",
        color: "var(--text-primary)",
        padding: "32px 20px",
      }}
    >
      <div style={{ maxWidth: 920, margin: "0 auto" }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12 }}>
          <div>
            <h1 style={{ margin: 0, fontSize: 26, letterSpacing: "-0.02em" }}>Términos y Condiciones</h1>
            <p style={{ margin: "6px 0 0", color: "var(--text-secondary)", fontSize: 13 }}>
              Última actualización: 20 de Abril de 2026
            </p>
          </div>
          <button
            type="button"
            onClick={onBack}
            style={{
              textDecoration: "none",
              fontSize: 13,
              fontWeight: 700,
              color: "var(--brand-600)",
              background: "var(--brand-100)",
              border: "1px solid var(--border)",
              padding: "10px 12px",
              borderRadius: 12,
              whiteSpace: "nowrap",
              cursor: "pointer",
            }}
          >
            Volver
          </button>
        </div>

        <section
          style={{
            marginTop: 22,
            background: "var(--bg-card)",
            border: "1px solid var(--border)",
            borderRadius: 16,
            padding: "18px 18px",
            boxShadow: "var(--shadow-sm)",
          }}
        >
          <h2 style={{ margin: 0, fontSize: 15 }}>1. Aceptación de los Términos</h2>
          <p style={{ margin: "10px 0 0", color: "var(--text-secondary)", lineHeight: 1.7, fontSize: 13 }}>
            Al acceder y utilizar BillNova, usted manifiesta haber leído, entendido y aceptado quedar vinculado 
            por los presentes Términos y Condiciones, así como por nuestra Política de Privacidad. Si no está de 
            acuerdo con alguno de estos términos, no debe utilizar la plataforma.
          </p>

          <h2 style={{ margin: "18px 0 0", fontSize: 15 }}>2. Descripción del Servicio</h2>
          <p style={{ margin: "10px 0 0", color: "var(--text-secondary)", lineHeight: 1.7, fontSize: 13 }}>
            BillNova es una plataforma de gestión empresarial conectada con Odoo que proporciona herramientas 
            para la administración de operaciones, facturación electrónica, gestión de inventarios, control de 
            pedidos, reportes financieros y moderación de contenido. El servicio incluye funcionalidades como:
          </p>
          <ul style={{ margin: "10px 0 0", color: "var(--text-secondary)", lineHeight: 1.7, fontSize: 13, paddingLeft: 20 }}>
            <li>Gestión de productos y categorías</li>
            <li>Emisión de facturas electrónicas</li>
            <li>Control de inventario y stock</li>
            <li>Seguimiento de pedidos</li>
            <li>Reportes y análisis de negocio</li>
            <li>Panel de moderation de contenido</li>
          </ul>

          <h2 style={{ margin: "18px 0 0", fontSize: 15 }}>3. Elegibilidad y Registro</h2>
          <p style={{ margin: "10px 0 0", color: "var(--text-secondary)", lineHeight: 1.7, fontSize: 13 }}>
            Para utilizar BillNova debe ser mayor de edad y tener capacidad legal para celebrar contratos. 
            Los comerciantes y empresas deben contar con las licencias y permisos correspondientes para operar 
            en su jurisdicción. El registro requiereporcionar información veraz, actualizada y completa.
          </p>

          <h2 style={{ margin: "18px 0 0", fontSize: 15 }}>4. Cuenta de Usuario y Seguridad</h2>
          <p style={{ margin: "10px 0 0", color: "var(--text-secondary)", lineHeight: 1.7, fontSize: 13 }}>
            Você é responsável por manter a confidencialidad de su cuenta y contraseña. Todas las 
            actividades realizadas bajo su cuenta son su responsabilidad. Debe notificar inmediatamente a 
            BillNova sobre cualquier uso no autorizado de su cuenta o contraseñas.
          </p>

          <h2 style={{ margin: "18px 0 0", fontSize: 15 }}>5. Obligaciones del Usuario</h2>
          <p style={{ margin: "10px 0 0", color: "var(--text-secondary)", lineHeight: 1.7, fontSize: 13 }}>
            Al utilizar BillNova, usted se compromete a:
          </p>
          <ul style={{ margin: "10px 0 0", color: "var(--text-secondary)", lineHeight: 1.7, fontSize: 13, paddingLeft: 20 }}>
            <li>Utilizar el servicio de acuerdo con la legislación aplicable</li>
            <li>No realizar actividades ilegales o no autorizadas</li>
            <li>No infringe derechos de terceros</li>
            <li>No intentar acceder a cuentas de otros usuarios</li>
            <li>No introducir virus, troyanos u otros códigos maliciosos</li>
            <li>Mantener sus datos de contacto actualizados</li>
          </ul>

          <h2 style={{ margin: "18px 0 0", fontSize: 15 }}>6. Propiedad Intelectual</h2>
          <p style={{ margin: "10px 0 0", color: "var(--text-secondary)", lineHeight: 1.7, fontSize: 13 }}>
            BillNova y todos sus contenidos, incluyendo pero no limitándose a texto, gráficos, logos, 
            imágenes, software y código, son propiedad de BillNova o sus licenciantes y están protegidos 
            por las leyes de propiedad intelectual. No puede copiar, modificar, distribuir, vender o alquiler 
            ninguna parte del servicio sin nuestro consentimiento previo por escrito.
          </p>

          <h2 style={{ margin: "18px 0 0", fontSize: 15 }}>7. Limitación de Responsabilidad</h2>
          <p style={{ margin: "10px 0 0", color: "var(--text-secondary)", lineHeight: 1.7, fontSize: 13 }}>
            BillNova se proporciona "tal cual" y "según disponibilidad". No garantizamos que el servicio sea 
            ininterrumpido, seguro o libre de errores. En ningún caso BillNova será responsable por daños indirectos, 
            incidentales, especiales o consecuentes derivados del uso o imposibilidad de usar el servicio.
          </p>

          <h2 style={{ margin: "18px 0 0", fontSize: 15 }}>8. Modificaciones del Servicio</h2>
          <p style={{ margin: "10px 0 0", color: "var(--text-secondary)", lineHeight: 1.7, fontSize: 13 }}>
            BillNova se reserva el derecho de modificar, suspender o discontinuar el servicio o cualquier parte 
            del mismo en cualquier momento. También podemos modificar estos términos. El uso continuo del servicio 
            después de modificaciones constituye aceptación de los nuevos términos.
          </p>

          <h2 style={{ margin: "18px 0 0", fontSize: 15 }}>9. Terminación</h2>
          <p style={{ margin: "10px 0 0", color: "var(--text-secondary)", lineHeight: 1.7, fontSize: 13 }}>
            BillNova puede terminar o suspender su acceso al servicio inmediatamente, sin previo aviso, si incumple estos 
            términos. Tras la terminación, su derecho a utilizar el servicio cesará inmediatamente. Las provisions relating a 
            propiedad intelectual, limitación de responsabilidad, indemnización y miscceláneos Surviven a la terminación.
          </p>

          <h2 style={{ margin: "18px 0 0", fontSize: 15 }}>10. Ley Aplicable y Resolución de Controversias</h2>
          <p style={{ margin: "10px 0 0", color: "var(--text-secondary)", lineHeight: 1.7, fontSize: 13 }}>
            Estos términos se rigen por las leyes del país donde está constituida BillNova. Cualquier controversia 
            derivada de estos términos será resuelta en los tribunales competentes de dicha jurisdicción.
          </p>

          <h2 style={{ margin: "18px 0 0", fontSize: 15 }}>11. Información de Contacto</h2>
          <p style={{ margin: "10px 0 0", color: "var(--text-secondary)", lineHeight: 1.7, fontSize: 13 }}>
            Si tiene preguntas sobre estos términos, por favor contáctenos a través de los canales de soporte 
            disponibles en la plataforma o mediante correo electrónico a soporte@billnova.com
          </p>
        </section>

        <section
          style={{
            marginTop: 22,
            background: "var(--bg-card)",
            border: "1px solid var(--border)",
            borderRadius: 16,
            padding: "18px 18px",
            boxShadow: "var(--shadow-sm)",
          }}
        >
          <h2 style={{ margin: 0, fontSize: 15 }}>Política de Privacidad</h2>
          <p style={{ margin: "10px 0 0", color: "var(--text-secondary)", lineHeight: 1.7, fontSize: 13 }}>
            BillNova está comprometido con la protección de su privacidad. Esta política describe cómo recopilamos, 
            usamos, almacenamos y protegemos su información personal.
          </p>

          <h2 style={{ margin: "18px 0 0", fontSize: 15 }}>1. Información que Recopilamos</h2>
          <p style={{ margin: "10px 0 0", color: "var(--text-secondary)", lineHeight: 1.7, fontSize: 13 }}>
            Recopilamos información que usted nos proporciona directamente, incluyendo:
          </p>
          <ul style={{ margin: "10px 0 0", color: "var(--text-secondary)", lineHeight: 1.7, fontSize: 13, paddingLeft: 20 }}>
            <li>Información de cuenta: nombre, correo electrónico, contraseña, empresa</li>
            <li>Datos de perfil: fotografía, teléfono, dirección</li>
            <li>Información de facturación: RFC/CUIT, dirección fiscal, datos bancarios</li>
            <li>Contenido generado: productos, facturas, pedidos, reportes</li>
            <li>Datos de uso: interacciones con la plataforma, logs de actividad</li>
          </ul>

          <h2 style={{ margin: "18px 0 0", fontSize: 15 }}>2. Cómo Usamos su Información</h2>
          <p style={{ margin: "10px 0 0", color: "var(--text-secondary)", lineHeight: 1.7, fontSize: 13 }}>
            Utilizamos su información para:
          </p>
          <ul style={{ margin: "10px 0 0", color: "var(--text-secondary)", lineHeight: 1.7, fontSize: 13, paddingLeft: 20 }}>
            <li>Proveer y personalizar el servicio</li>
            <li>Procesar transacciones y emitir facturas</li>
            <li>Gestionar su cuenta y soporte técnico</li>
            <li>Comunicarnos sobre actualizaciones y notificaciones</li>
            <li>Mejorar nuestros servicios y experiencia de usuario</li>
            <li>Cumplir obligaciones legales y fiscales</li>
            <li>Prevenir fraude y garantizar seguridad</li>
          </ul>

          <h2 style={{ margin: "18px 0 0", fontSize: 15 }}>3. Almacenamiento y Seguridad</h2>
          <p style={{ margin: "10px 0 0", color: "var(--text-secondary)", lineHeight: 1.7, fontSize: 13 }}>
            Sus datos se almacenan en servidores seguros con medidas de protección físicas, electrónicas y 
            procedimentales adecuadas. Implementamos encriptación, autenticación y controles de acceso para proteger 
            su información contra acceso no autorizado.
          </p>

          <h2 style={{ margin: "18px 0 0", fontSize: 15 }}>4. Compartición de Datos</h2>
          <p style={{ margin: "10px 0 0", color: "var(--text-secondary)", lineHeight: 1.7, fontSize: 13 }}>
            No vendemos, alquilamos ni compartimos su información personal con terceros excepto:
          </p>
          <ul style={{ margin: "10px 0 0", color: "var(--text-secondary)", lineHeight: 1.7, fontSize: 13, paddingLeft: 20 }}>
            <li>Proveedores de servicios que nos ayudan a operar la plataforma</li>
            <li>Cuando sea necesario para cumplir la ley o resolver disputas</li>
            <li>Con su consentimiento previo</li>
            <li>Organismos fiscais para cumplimiento de obligaciones tributarias</li>
          </ul>

          <h2 style={{ margin: "18px 0 0", fontSize: 15 }}>5. Retención de Datos</h2>
          <p style={{ margin: "10px 0 0", color: "var(--text-secondary)", lineHeight: 1.7, fontSize: 13 }}>
            Conservamos su información mientras su cuenta esté activa y según sea necesario para предоставлять 
            servicios. Los datos de facturación se retienen según las leyes fiscales aplicables. puede solicitar 
            la eliminación de sus datos cuando la cuenta sea eliminada, sujeito a obligaciones legales de retención.
          </p>

          <h2 style={{ margin: "18px 0 0", fontSize: 15 }}>6. Sus Derechos</h2>
          <p style={{ margin: "10px 0 0", color: "var(--text-secondary)", lineHeight: 1.7, fontSize: 13 }}>
            Usted tiene derecho a:
          </p>
          <ul style={{ margin: "10px 0 0", color: "var(--text-secondary)", lineHeight: 1.7, fontSize: 13, paddingLeft: 20 }}>
            <li>Acceder a sus datos personales</li>
            <li>Rectificar datos inexactos</li>
            <li>Solicitar eliminación de sus datos</li>
            <li>Oponerse al tratamiento tertentu</li>
            <li>Exportar sus datos en formato portable</li>
            <li>Retirar consentimiento en cualquier momento</li>
          </ul>

          <h2 style={{ margin: "18px 0 0", fontSize: 15 }}>7. Cookies y Tecnologías Similares</h2>
          <p style={{ margin: "10px 0 0", color: "var(--text-secondary)", lineHeight: 1.7, fontSize: 13 }}>
            BillNova utiliza cookies y tecnologías similares para mejorar su experiencia, analizar tráfico 
            y personalizar contenido. Puede configurar su navegador para rechazar cookies, aunque esto puede 
            afectar la funcionalidad del servicio.
          </p>

          <h2 style={{ margin: "18px 0 0", fontSize: 15 }}>8. Transferencias Internacionales</h2>
          <p style={{ margin: "10px 0 0", color: "var(--text-secondary)", lineHeight: 1.7, fontSize: 13 }}>
            Sus datos pueden transferirse y procesarse en servidores ubicados en diferentes países. 
            Implementamos salvaguardas apropriadas para proteja su información durante estas transferencias, 
            incluyendo clauses contractuales estándar de la Unión Europea.
          </p>

          <h2 style={{ margin: "18px 0 0", fontSize: 15 }}>9. Menores de Edad</h2>
          <p style={{ margin: "10px 0 0", color: "var(--text-secondary)", lineHeight: 1.7, fontSize: 13 }}>
            BillNova no está dirigido a menores de 18 años. No recopilamos intencionalmente información de menores. 
            Si descubrimos que hemos recopilado datos de un menor, eliminaremos dicha información inmediatamente.
          </p>

          <h2 style={{ margin: "18px 0 0", fontSize: 15 }}>10. Cambios a esta Política</h2>
          <p style={{ margin: "10px 0 0", color: "var(--text-secondary)", lineHeight: 1.7, fontSize: 13 }}>
            Podemos actualizar esta política periódicamente. Notificaremos cambios significativos através de un aviso 
            en la plataforma o por correo electrónico. El uso continuo de BillNova después de cambios constituye aceptación 
            de la política actualizada.
          </p>

          <h2 style={{ margin: "18px 0 0", fontSize: 15 }}>11. Contacto</h2>
          <p style={{ margin: "10px 0 0", color: "var(--text-secondary)", lineHeight: 1.7, fontSize: 13 }}>
            Para ejercer sus derechos o realizar consultas sobre esta política, contáctenos a través de 
            privacidad@billnova.com o mediante la sección de configuración en la plataforma.
          </p>
        </section>
      </div>
    </main>
  );
}

