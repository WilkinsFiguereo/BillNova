"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { apiListModeratorCompanies, apiSetCompanyModerationStatus } from "../../data/moderatorApi";
import { Company, CompanyStatus, StatusFilter } from "../types/companies.types";

interface UseCompaniesReturn {
  companies: Company[];
  search: string;
  activeFilter: StatusFilter;
  activeType: string;
  selectedCompany: Company | null;
  rejectModalVisible: boolean;
  companyToReject: Company | null;
  rejectionReason: string;
  toastVisible: boolean;
  toastMessage: string;
  toastType: "success" | "error";
  filteredCompanies: Company[];
  counters: Record<CompanyStatus | "all", number>;
  setSearch: (v: string) => void;
  setActiveFilter: (v: StatusFilter) => void;
  setActiveType: (v: string) => void;
  setRejectionReason: (v: string) => void;
  viewDetail: (c: Company | null) => void;
  approve: (id: string) => void;
  openRejectModal: (c: Company) => void;
  closeRejectModal: () => void;
  confirmRejection: () => void;
}

export function useCompanies(): UseCompaniesReturn {
  const [companies, setCompanies] = useState<Company[]>([]);
  const [search, setSearch] = useState("");
  const [activeFilter, setActiveFilter] = useState<StatusFilter>("all");
  const [activeType, setActiveType] = useState("All");
  const [selectedCompany, setSelectedCompany] = useState<Company | null>(null);
  const [rejectModalVisible, setRejectModalVisible] = useState(false);
  const [companyToReject, setCompanyToReject] = useState<Company | null>(null);
  const [rejectionReason, setRejectionReason] = useState("");
  const [toastVisible, setToastVisible] = useState(false);
  const [toastMessage, setToastMessage] = useState("");
  const [toastType, setToastType] = useState<"success" | "error">("success");

  const showToast = useCallback((message: string, type: "success" | "error" = "success") => {
    setToastMessage(message);
    setToastType(type);
    setToastVisible(true);
    setTimeout(() => setToastVisible(false), 3500);
  }, []);

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const rows = await apiListModeratorCompanies();
        if (mounted) setCompanies(rows as Company[]);
      } catch {
        if (mounted) showToast("No se pudieron cargar las empresas", "error");
      }
    })();
    return () => {
      mounted = false;
    };
  }, [showToast]);

  const updateStatus = useCallback((id: string, status: "approved" | "rejected", reason?: string) => {
    setCompanies((prev) => prev.map((company) => (company.id === id ? { ...company, status, rejectionReason: reason } : company)));
    setSelectedCompany((prev) => (prev?.id === id ? { ...prev, status, rejectionReason: reason } : prev));
  }, []);

  const approve = useCallback(
    (id: string) => {
      (async () => {
        try {
          await apiSetCompanyModerationStatus(id, "approved");
          updateStatus(id, "approved");
          showToast("Empresa aprobada y activa en la plataforma", "success");
        } catch {
          showToast("No se pudo aprobar la empresa", "error");
        }
      })();
    },
    [updateStatus, showToast],
  );

  const openRejectModal = useCallback((company: Company) => {
    setCompanyToReject(company);
    setRejectionReason("");
    setRejectModalVisible(true);
  }, []);

  const closeRejectModal = useCallback(() => {
    setRejectModalVisible(false);
    setCompanyToReject(null);
    setRejectionReason("");
  }, []);

  const confirmRejection = useCallback(() => {
    if (!companyToReject) return;
    (async () => {
      try {
        const reason = rejectionReason || "Sin motivo especificado";
        await apiSetCompanyModerationStatus(companyToReject.id, "rejected", reason);
        updateStatus(companyToReject.id, "rejected", reason);
        closeRejectModal();
        showToast("Empresa rechazada.", "error");
      } catch {
        showToast("No se pudo rechazar la empresa", "error");
      }
    })();
  }, [companyToReject, rejectionReason, updateStatus, closeRejectModal, showToast]);

  const counters = useMemo(
    () => ({
      all: companies.length,
      pending: companies.filter((company) => company.status === "pending").length,
      approved: companies.filter((company) => company.status === "approved").length,
      rejected: companies.filter((company) => company.status === "rejected").length,
    }),
    [companies],
  );

  const filteredCompanies = useMemo(() => {
    let list = [...companies];

    if (activeFilter !== "all") {
      list = list.filter((company) => company.status === activeFilter);
    }
    if (activeType !== "All") {
      list = list.filter((company) => company.type === activeType);
    }
    if (search) {
      const q = search.toLowerCase();
      list = list.filter(
        (company) =>
          company.name.toLowerCase().includes(q) ||
          company.taxId.toLowerCase().includes(q) ||
          company.representative.toLowerCase().includes(q) ||
          company.country.toLowerCase().includes(q),
      );
    }

    const order: Record<CompanyStatus, number> = { pending: 0, approved: 1, rejected: 2 };
    list.sort((a, b) => order[a.status] - order[b.status]);

    return list;
  }, [companies, activeFilter, activeType, search]);

  return {
    companies,
    search,
    activeFilter,
    activeType,
    selectedCompany,
    rejectModalVisible,
    companyToReject,
    rejectionReason,
    toastVisible,
    toastMessage,
    toastType,
    filteredCompanies,
    counters,
    setSearch,
    setActiveFilter,
    setActiveType,
    setRejectionReason,
    viewDetail: setSelectedCompany,
    approve,
    openRejectModal,
    closeRejectModal,
    confirmRejection,
  };
}
