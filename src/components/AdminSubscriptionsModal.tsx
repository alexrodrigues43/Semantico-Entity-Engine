import React, { useState, useEffect } from "react";
import { 
  X, 
  ShieldCheck, 
  Users, 
  UserCheck, 
  Clock, 
  Ban, 
  Search, 
  Filter, 
  Check, 
  Trash2, 
  Edit3, 
  Save, 
  Zap, 
  ExternalLink,
  DollarSign,
  AlertCircle,
  RefreshCw,
  Sparkles
} from "lucide-react";
import { collection, onSnapshot, query, orderBy } from "firebase/firestore";
import { db, adminUpdateUser, adminDeleteUser, isSuperAdminEmail } from "../lib/firebase";
import { UserProfile, UserRole, UserStatus, UserPlan } from "../types";

interface AdminSubscriptionsModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentUser: UserProfile;
}

export const AdminSubscriptionsModal: React.FC<AdminSubscriptionsModalProps> = ({
  isOpen,
  onClose,
  currentUser,
}) => {
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<"all" | UserStatus>("all");
  const [editingNotesId, setEditingNotesId] = useState<string | null>(null);
  const [tempNotes, setTempNotes] = useState("");
  const [actionSuccessMsg, setActionSuccessMsg] = useState<string | null>(null);

  const showNotice = (msg: string) => {
    setActionSuccessMsg(msg);
    setTimeout(() => setActionSuccessMsg(null), 3000);
  };

  // Real-time Firestore subscription to users collection
  useEffect(() => {
    if (!isOpen) return;

    setLoading(true);
    const q = query(collection(db, "users"));
    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        const list: UserProfile[] = [];
        snapshot.forEach((docSnap) => {
          list.push(docSnap.data() as UserProfile);
        });
        // Sort: pending first, then by createdAt desc
        list.sort((a, b) => {
          if (a.status === "pending" && b.status !== "pending") return -1;
          if (b.status === "pending" && a.status !== "pending") return 1;
          return new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime();
        });
        setUsers(list);
        setLoading(false);
      },
      (error) => {
        console.error("Erro ao carregar usuários no painel admin:", error);
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, [isOpen]);

  if (!isOpen) return null;

  // Metrics
  const totalCount = users.length;
  const activeCount = users.filter((u) => u.status === "active").length;
  const pendingCount = users.filter((u) => u.status === "pending").length;
  const blockedCount = users.filter((u) => u.status === "blocked" || u.status === "expired").length;

  // Filtering
  const filteredUsers = users.filter((u) => {
    // Status filter
    if (statusFilter !== "all" && u.status !== statusFilter) return false;

    // Search query
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchEmail = u.email?.toLowerCase().includes(q);
      const matchName = u.displayName?.toLowerCase().includes(q);
      const matchNotes = u.notes?.toLowerCase().includes(q);
      const matchPlan = u.plan?.toLowerCase().includes(q);
      if (!matchEmail && !matchName && !matchNotes && !matchPlan) return false;
    }
    return true;
  });

  const handleToggleStatus = async (user: UserProfile) => {
    try {
      const newStatus: UserStatus = user.status === "active" ? "blocked" : "active";
      await adminUpdateUser(user.uid, { status: newStatus });
      showNotice(
        newStatus === "active" 
          ? `Acesso de ${user.displayName || user.email} foi LIBERADO com sucesso!` 
          : `Acesso de ${user.displayName || user.email} foi BLOQUEADO.`
      );
    } catch (err: any) {
      console.error("Erro ao alterar status:", err);
      alert("Erro ao alterar status do usuário: " + err.message);
    }
  };

  const handleQuickApprove = async (user: UserProfile) => {
    try {
      await adminUpdateUser(user.uid, { 
        status: "active",
        plan: user.plan === "trial" ? "monthly" : user.plan
      });
      showNotice(`Acesso aprovado para ${user.displayName || user.email}!`);
    } catch (err: any) {
      console.error("Erro ao aprovar usuário:", err);
      alert("Erro: " + err.message);
    }
  };

  const handleChangePlan = async (user: UserProfile, newPlan: UserPlan) => {
    try {
      await adminUpdateUser(user.uid, { plan: newPlan });
      showNotice(`Plano de ${user.displayName || user.email} atualizado para ${newPlan}.`);
    } catch (err: any) {
      console.error("Erro ao alterar plano:", err);
      alert("Erro ao alterar plano: " + err.message);
    }
  };

  const handleSaveNotes = async (user: UserProfile) => {
    try {
      await adminUpdateUser(user.uid, { notes: tempNotes.trim() });
      setEditingNotesId(null);
      showNotice("Anotações salvas com sucesso.");
    } catch (err: any) {
      console.error("Erro ao salvar notas:", err);
      alert("Erro ao salvar notas: " + err.message);
    }
  };

  const handleDeleteUser = async (user: UserProfile) => {
    if (isSuperAdminEmail(user.email)) {
      alert("O Super Administrador Master não pode ser excluído.");
      return;
    }

    if (window.confirm(`Tem certeza que deseja excluir o cadastro de ${user.email}? Esta ação é irreversível.`)) {
      try {
        await adminDeleteUser(user.uid);
        showNotice(`Cadastro de ${user.email} excluído com sucesso.`);
      } catch (err: any) {
        console.error("Erro ao excluir usuário:", err);
        alert("Erro ao excluir usuário: " + err.message);
      }
    }
  };

  const getPlanBadge = (plan?: UserPlan) => {
    switch (plan) {
      case "lifetime":
        return "bg-purple-100 text-purple-800 border-purple-200";
      case "annual":
        return "bg-blue-100 text-blue-800 border-blue-200";
      case "monthly":
        return "bg-emerald-100 text-emerald-800 border-emerald-200";
      case "trial":
      default:
        return "bg-slate-100 text-slate-700 border-slate-200";
    }
  };

  const getStatusBadge = (status: UserStatus) => {
    switch (status) {
      case "active":
        return {
          label: "Ativo",
          className: "bg-emerald-50 text-emerald-700 border-emerald-300 font-bold",
        };
      case "pending":
        return {
          label: "Pendente",
          className: "bg-amber-50 text-amber-700 border-amber-300 font-bold animate-pulse",
        };
      case "blocked":
        return {
          label: "Bloqueado",
          className: "bg-red-50 text-red-700 border-red-300 font-bold",
        };
      case "expired":
        return {
          label: "Expirado",
          className: "bg-slate-100 text-slate-600 border-slate-300",
        };
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/70 backdrop-blur-xs animate-in fade-in duration-200">
      <div 
        className="bg-white border border-slate-200 rounded-3xl w-full max-w-6xl max-h-[92vh] shadow-2xl flex flex-col overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="px-6 py-4 bg-slate-900 text-white flex items-center justify-between border-b border-slate-800 shrink-0">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-[#fdd910] text-black">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base font-black tracking-tight text-white">
                  Painel Administrativo de Assinaturas & Acessos
                </h2>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-[#fdd910]/20 text-[#fdd910] border border-[#fdd910]/30">
                  Super Admin
                </span>
              </div>
              <p className="text-xs text-slate-400">
                Gerenciamento de clientes, liberação em 1 clique, planos e anotações financeiras
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors cursor-pointer"
            title="Fechar"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Notice Banner */}
        {actionSuccessMsg && (
          <div className="bg-emerald-50 border-b border-emerald-200 px-6 py-2.5 text-xs text-emerald-800 font-bold flex items-center gap-2 animate-in fade-in shrink-0">
            <Check className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>{actionSuccessMsg}</span>
          </div>
        )}

        {/* Top Metrics Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 p-6 pb-4 bg-slate-50 border-b border-slate-200 shrink-0">
          <div className="bg-white p-3.5 rounded-2xl border border-slate-200/80 shadow-2xs">
            <div className="flex items-center justify-between text-slate-500 mb-1">
              <span className="text-[11px] font-bold uppercase tracking-wider">Total de Cadastros</span>
              <Users className="w-4 h-4 text-slate-400" />
            </div>
            <div className="text-2xl font-black text-slate-900">{totalCount}</div>
          </div>

          <div className="bg-white p-3.5 rounded-2xl border border-emerald-200/80 shadow-2xs">
            <div className="flex items-center justify-between text-emerald-700 mb-1">
              <span className="text-[11px] font-bold uppercase tracking-wider">Assinantes Ativos</span>
              <UserCheck className="w-4 h-4 text-emerald-600" />
            </div>
            <div className="text-2xl font-black text-emerald-700">{activeCount}</div>
          </div>

          <div 
            onClick={() => setStatusFilter("pending")}
            className="bg-white p-3.5 rounded-2xl border border-amber-300 shadow-2xs cursor-pointer hover:bg-amber-50/50 transition-colors"
          >
            <div className="flex items-center justify-between text-amber-800 mb-1">
              <span className="text-[11px] font-bold uppercase tracking-wider flex items-center gap-1.5">
                <span>Pendentes</span>
                {pendingCount > 0 && (
                  <span className="w-2 h-2 rounded-full bg-amber-500 animate-ping" />
                )}
              </span>
              <Clock className="w-4 h-4 text-amber-600" />
            </div>
            <div className="text-2xl font-black text-amber-600">{pendingCount}</div>
          </div>

          <div className="bg-white p-3.5 rounded-2xl border border-slate-200/80 shadow-2xs">
            <div className="flex items-center justify-between text-slate-500 mb-1">
              <span className="text-[11px] font-bold uppercase tracking-wider">Bloqueados / Exp.</span>
              <Ban className="w-4 h-4 text-red-500" />
            </div>
            <div className="text-2xl font-black text-slate-700">{blockedCount}</div>
          </div>
        </div>

        {/* Filter and Search Bar */}
        <div className="px-6 py-3 bg-white border-b border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-3 shrink-0">
          {/* Status Filter Buttons */}
          <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl w-full sm:w-auto">
            <button
              onClick={() => setStatusFilter("all")}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                statusFilter === "all"
                  ? "bg-white text-slate-900 shadow-2xs"
                  : "text-slate-600 hover:text-slate-900"
              }`}
            >
              Todos ({totalCount})
            </button>
            <button
              onClick={() => setStatusFilter("pending")}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                statusFilter === "pending"
                  ? "bg-amber-500 text-white shadow-2xs"
                  : "text-amber-700 hover:text-amber-900"
              }`}
            >
              <span>Pendentes</span>
              {pendingCount > 0 && (
                <span className={`px-1.5 py-0.2 text-[10px] rounded-full font-black ${
                  statusFilter === "pending" ? "bg-white text-amber-800" : "bg-amber-200 text-amber-900"
                }`}>
                  {pendingCount}
                </span>
              )}
            </button>
            <button
              onClick={() => setStatusFilter("active")}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                statusFilter === "active"
                  ? "bg-emerald-600 text-white shadow-2xs"
                  : "text-emerald-700 hover:text-emerald-900"
              }`}
            >
              Ativos ({activeCount})
            </button>
            <button
              onClick={() => setStatusFilter("blocked")}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                statusFilter === "blocked"
                  ? "bg-red-600 text-white shadow-2xs"
                  : "text-red-700 hover:text-red-900"
              }`}
            >
              Bloqueados ({blockedCount})
            </button>
          </div>

          {/* Search Input */}
          <div className="relative w-full sm:w-80">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Buscar por e-mail, nome ou notas..."
              className="w-full text-xs pl-9 pr-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-slate-800 transition-colors"
            />
          </div>
        </div>

        {/* Users Table / List */}
        <div className="flex-1 overflow-y-auto p-6">
          {loading ? (
            <div className="flex flex-col items-center justify-center py-16 text-slate-400 gap-3">
              <RefreshCw className="w-7 h-7 animate-spin text-slate-400" />
              <span className="text-xs font-medium">Sincronizando usuários do Firestore...</span>
            </div>
          ) : filteredUsers.length === 0 ? (
            <div className="text-center py-16 text-slate-400">
              <Users className="w-10 h-10 mx-auto stroke-1 mb-2 text-slate-300" />
              <p className="text-sm font-semibold text-slate-600">Nenhum usuário encontrado</p>
              <p className="text-xs text-slate-400 mt-1">Tente ajustar os filtros ou a busca acima.</p>
            </div>
          ) : (
            <div className="border border-slate-200 rounded-2xl overflow-hidden shadow-2xs">
              <table className="w-full text-left text-xs border-collapse">
                <thead className="bg-slate-50 text-slate-500 font-bold border-b border-slate-200">
                  <tr>
                    <th className="py-3 px-4">Usuário</th>
                    <th className="py-3 px-3">Papel & Status</th>
                    <th className="py-3 px-3">Plano</th>
                    <th className="py-3 px-3 text-center">Uso de IA</th>
                    <th className="py-3 px-3">Anotações Internas (PIX, Contato)</th>
                    <th className="py-3 px-4 text-right">Ações Rápidas</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 bg-white">
                  {filteredUsers.map((user) => {
                    const isSuper = isSuperAdminEmail(user.email);
                    const statusInfo = getStatusBadge(user.status);
                    const isEditingThisNote = editingNotesId === user.uid;

                    return (
                      <tr 
                        key={user.uid} 
                        className={`hover:bg-slate-50/70 transition-colors ${
                          user.status === "pending" ? "bg-amber-50/20" : ""
                        }`}
                      >
                        {/* User info */}
                        <td className="py-3.5 px-4">
                          <div className="flex items-center gap-3">
                            {user.photoURL ? (
                              <img 
                                src={user.photoURL} 
                                alt={user.displayName} 
                                className="w-8 h-8 rounded-full border border-slate-200 object-cover"
                                referrerPolicy="no-referrer"
                              />
                            ) : (
                              <div className="w-8 h-8 rounded-full bg-slate-900 text-[#fdd910] flex items-center justify-center font-bold text-xs">
                                {(user.displayName || user.email || "U")[0].toUpperCase()}
                              </div>
                            )}

                            <div>
                              <div className="flex items-center gap-1.5 font-bold text-slate-900">
                                <span>{user.displayName || "Sem nome"}</span>
                                {isSuper && (
                                  <span className="text-[10px] bg-[#fdd910]/25 text-slate-900 px-1.5 py-0.2 rounded font-black">
                                    👑 Master
                                  </span>
                                )}
                              </div>
                              <div className="text-[11px] text-slate-500 font-mono">
                                {user.email}
                              </div>
                              <div className="text-[10px] text-slate-400 mt-0.5">
                                Cadastro: {user.createdAt ? new Date(user.createdAt).toLocaleDateString("pt-BR") : "N/D"}
                              </div>
                            </div>
                          </div>
                        </td>

                        {/* Role & Status */}
                        <td className="py-3.5 px-3">
                          <div className="space-y-1">
                            <div>
                              <span className={`inline-block text-[10px] uppercase tracking-wider px-2 py-0.5 rounded-md border ${statusInfo.className}`}>
                                {statusInfo.label}
                              </span>
                            </div>
                            <div className="text-[10px] text-slate-400 uppercase font-semibold">
                              {user.role === "admin" ? "Administrador" : "Cliente"}
                            </div>
                          </div>
                        </td>

                        {/* Plan */}
                        <td className="py-3.5 px-3">
                          <div className="space-y-1">
                            <select
                              value={user.plan || "trial"}
                              disabled={isSuper}
                              onChange={(e) => handleChangePlan(user, e.target.value as UserPlan)}
                              className={`text-[11px] font-bold px-2 py-1 rounded-lg border focus:outline-none cursor-pointer ${getPlanBadge(user.plan)}`}
                            >
                              <option value="trial">Trial / Teste</option>
                              <option value="monthly">Mensal</option>
                              <option value="annual">Anual</option>
                              <option value="lifetime">Vitalício</option>
                            </select>
                          </div>
                        </td>

                        {/* Tool Usage */}
                        <td className="py-3.5 px-3 text-center">
                          <div className="inline-flex items-center gap-1 px-2 py-1 bg-slate-100 rounded-lg text-slate-700 font-mono font-bold text-xs" title="Total de execuções de ferramentas">
                            <Sparkles className="w-3 h-3 text-[#fdd910]" />
                            <span>{user.toolUsageCount || 0}</span>
                          </div>
                        </td>

                        {/* Internal Notes */}
                        <td className="py-3.5 px-3 max-w-xs">
                          {isEditingThisNote ? (
                            <div className="flex items-center gap-1.5 animate-in fade-in">
                              <input
                                type="text"
                                value={tempNotes}
                                onChange={(e) => setTempNotes(e.target.value)}
                                placeholder="PIX, comprovante, telefone..."
                                className="w-full text-xs px-2 py-1 border border-slate-300 rounded-lg focus:outline-none focus:border-slate-800"
                                autoFocus
                                onKeyDown={(e) => {
                                  if (e.key === "Enter") handleSaveNotes(user);
                                  if (e.key === "Escape") setEditingNotesId(null);
                                }}
                              />
                              <button
                                onClick={() => handleSaveNotes(user)}
                                className="p-1 bg-emerald-600 text-white rounded-md hover:bg-emerald-700 cursor-pointer"
                                title="Salvar nota"
                              >
                                <Save className="w-3.5 h-3.5" />
                              </button>
                              <button
                                onClick={() => setEditingNotesId(null)}
                                className="p-1 text-slate-400 hover:text-slate-600 cursor-pointer"
                                title="Cancelar"
                              >
                                <X className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          ) : (
                            <div 
                              onClick={() => {
                                setEditingNotesId(user.uid);
                                setTempNotes(user.notes || "");
                              }}
                              className="group flex items-center justify-between gap-1 p-1.5 rounded-lg hover:bg-slate-100/80 cursor-pointer border border-transparent hover:border-slate-200 transition-all text-[11px]"
                              title="Clique para editar nota interna"
                            >
                              <span className={`truncate ${user.notes ? "text-slate-800" : "text-slate-400 italic"}`}>
                                {user.notes || "Clique para adicionar anotação..."}
                              </span>
                              <Edit3 className="w-3 h-3 text-slate-400 group-hover:text-slate-600 shrink-0 opacity-0 group-hover:opacity-100" />
                            </div>
                          )}
                        </td>

                        {/* Actions */}
                        <td className="py-3.5 px-4 text-right">
                          <div className="flex items-center justify-end gap-1.5">
                            {/* If pending: prominent 1-click approve button */}
                            {user.status === "pending" ? (
                              <button
                                onClick={() => handleQuickApprove(user)}
                                className="px-3 py-1.5 bg-[#7bc970] hover:bg-[#6ab860] text-black font-extrabold rounded-lg text-xs flex items-center gap-1 shadow-sm transition-all cursor-pointer active:scale-95"
                                title="Liberar acesso instantaneamente"
                              >
                                <Check className="w-3.5 h-3.5 stroke-[2.5]" />
                                <span>Liberar Acesso</span>
                              </button>
                            ) : (
                              <button
                                onClick={() => handleToggleStatus(user)}
                                disabled={isSuper}
                                className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-colors cursor-pointer disabled:opacity-30 ${
                                  user.status === "active"
                                    ? "bg-slate-100 hover:bg-red-50 text-slate-700 hover:text-red-700 border border-slate-200"
                                    : "bg-emerald-100 hover:bg-emerald-200 text-emerald-800 border border-emerald-300"
                                }`}
                                title={user.status === "active" ? "Bloquear acesso" : "Reativar acesso"}
                              >
                                {user.status === "active" ? "Bloquear" : "Reativar"}
                              </button>
                            )}

                            {/* Delete User */}
                            {!isSuper && (
                              <button
                                onClick={() => handleDeleteUser(user)}
                                className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors cursor-pointer"
                                title="Excluir cadastro do Firestore"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-3 bg-slate-50 border-t border-slate-200 flex items-center justify-between text-xs text-slate-500 shrink-0">
          <span className="flex items-center gap-1.5">
            <ShieldCheck className="w-4 h-4 text-emerald-600" />
            <span>Regras de segurança ativas: apenas o Super Admin pode alterar permissões e status.</span>
          </span>
          <button
            onClick={onClose}
            className="px-4 py-1.5 bg-slate-200 hover:bg-slate-300 text-slate-700 font-bold rounded-lg transition-colors cursor-pointer"
          >
            Fechar Painel
          </button>
        </div>

      </div>
    </div>
  );
};
