"use client";

import { useState, useTransition } from "react";
import { X, Plus, Building2, Loader2, Phone, Mail, Key, FileText, Clock } from "lucide-react";
import { createSupplier } from "@/actions/purchases";
import { toast } from "sonner";

interface NewSupplierModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCreated?: () => void;
}

const CATEGORY_SUGGESTIONS = [
  "Malharia / Camisetas Lisas",
  "Impressão DTF Têxtil",
  "Embalagens & Sacos Zip",
  "Etiquetas & Tags Kraft",
  "Adesivos & Brindes",
  "Fitas & Lacres",
];

export function NewSupplierModal({ isOpen, onClose, onCreated }: NewSupplierModalProps) {
  const [isPending, startTransition] = useTransition();

  const [name, setName] = useState("");
  const [contactName, setContactName] = useState("");
  const [category, setCategory] = useState("Malharia / Camisetas Lisas");
  const [whatsapp, setWhatsapp] = useState("");
  const [email, setEmail] = useState("");
  const [pixKey, setPixKey] = useState("");
  const [notes, setNotes] = useState("");
  const [leadTimeDays, setLeadTimeDays] = useState(3);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      toast.error("Informe o nome da empresa ou fornecedor.");
      return;
    }

    startTransition(async () => {
      try {
        await createSupplier({
          name: name.trim(),
          category: category.trim() || "Geral",
          contactName: contactName.trim() || undefined,
          whatsapp: whatsapp.trim() || undefined,
          email: email.trim() || undefined,
          pixKey: pixKey.trim() || undefined,
          notes: notes.trim() || undefined,
          leadTimeDays: Number(leadTimeDays) || 3,
        });

        toast.success(`Fornecedor "${name}" cadastrado com sucesso!`);
        if (onCreated) onCreated();
        onClose();
      } catch (err: any) {
        toast.error("Erro ao cadastrar fornecedor: " + err.message);
      }
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div
        className="w-full max-w-lg bg-zinc-950 border border-zinc-800 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[92vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-zinc-800/80 bg-zinc-900/40">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-amber-500/10 text-amber-400 border border-amber-500/20">
              <Building2 size={16} />
            </div>
            <div>
              <h3 className="text-sm font-bold text-zinc-100">
                + Novo Fornecedor Homologado
              </h3>
              <p className="text-xs text-zinc-500">
                Cadastre malharias, birôs de DTF ou distribuidores de embalagens.
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-zinc-400 hover:text-zinc-100 hover:bg-zinc-800 transition cursor-pointer"
          >
            <X size={18} />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4 overflow-y-auto flex-1 text-xs">
          {/* Nome & Contato */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-zinc-400 mb-1 font-medium">Nome da Empresa / Fornecedor *</label>
              <input
                required
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="ex: Malharia Elite Têxtil"
                className="w-full px-3 py-2 rounded-xl bg-zinc-900/80 border border-zinc-800 text-zinc-100 placeholder:text-zinc-600 focus:outline-none focus:border-zinc-700"
              />
            </div>

            <div>
              <label className="block text-zinc-400 mb-1 font-medium">Nome do Vendedor / Contato</label>
              <input
                type="text"
                value={contactName}
                onChange={(e) => setContactName(e.target.value)}
                placeholder="ex: Rodrigo Vendas"
                className="w-full px-3 py-2 rounded-xl bg-zinc-900/80 border border-zinc-800 text-zinc-100 placeholder:text-zinc-600 focus:outline-none focus:border-zinc-700"
              />
            </div>
          </div>

          {/* Tipo de Fornecimento */}
          <div>
            <label className="block text-zinc-400 mb-1 font-medium">
              Tipo de Fornecimento / Categoria *
            </label>
            <input
              required
              type="text"
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              placeholder="ex: Malharia / Camisetas Lisas"
              className="w-full px-3 py-2 rounded-xl bg-zinc-900/80 border border-zinc-800 text-zinc-100 placeholder:text-zinc-600 focus:outline-none focus:border-zinc-700 mb-1.5"
            />
            <div className="flex flex-wrap gap-1.5">
              {CATEGORY_SUGGESTIONS.map((cat) => (
                <button
                  type="button"
                  key={cat}
                  onClick={() => setCategory(cat)}
                  className={`text-[10px] px-2 py-0.5 rounded-md border transition cursor-pointer ${
                    category === cat
                      ? "bg-amber-500/10 text-amber-300 border-amber-500/30"
                      : "bg-zinc-900/60 text-zinc-400 border-zinc-800 hover:text-zinc-200"
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>

          {/* WhatsApp & Email */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-zinc-400 mb-1 font-medium flex items-center gap-1.5">
                <Phone size={12} className="text-emerald-400" />
                <span>Telefone / WhatsApp</span>
              </label>
              <input
                type="text"
                value={whatsapp}
                onChange={(e) => setWhatsapp(e.target.value)}
                placeholder="(11) 98765-4321"
                className="w-full px-3 py-2 rounded-xl bg-zinc-900/80 border border-zinc-800 text-zinc-100 placeholder:text-zinc-600 focus:outline-none focus:border-zinc-700"
              />
            </div>

            <div>
              <label className="block text-zinc-400 mb-1 font-medium flex items-center gap-1.5">
                <Mail size={12} className="text-blue-400" />
                <span>E-mail</span>
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="pedidos@fornecedor.com.br"
                className="w-full px-3 py-2 rounded-xl bg-zinc-900/80 border border-zinc-800 text-zinc-100 placeholder:text-zinc-600 focus:outline-none focus:border-zinc-700"
              />
            </div>
          </div>

          {/* Chave Pix & Prazo */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="sm:col-span-2">
              <label className="block text-zinc-400 mb-1 font-medium flex items-center gap-1.5">
                <Key size={12} className="text-amber-400" />
                <span>Chave Pix para Pagamento</span>
              </label>
              <input
                type="text"
                value={pixKey}
                onChange={(e) => setPixKey(e.target.value)}
                placeholder="CNPJ, E-mail ou Celular Pix"
                className="w-full px-3 py-2 rounded-xl bg-zinc-900/80 border border-zinc-800 text-zinc-100 placeholder:text-zinc-600 font-mono text-[11px] focus:outline-none focus:border-zinc-700"
              />
            </div>

            <div>
              <label className="block text-zinc-400 mb-1 font-medium flex items-center gap-1.5">
                <Clock size={12} className="text-zinc-400" />
                <span>Prazo Médio (dias)</span>
              </label>
              <input
                type="number"
                min={1}
                value={leadTimeDays}
                onChange={(e) => setLeadTimeDays(parseInt(e.target.value) || 3)}
                className="w-full px-3 py-2 rounded-xl bg-zinc-900/80 border border-zinc-800 text-zinc-100 font-mono text-center focus:outline-none focus:border-zinc-700"
              />
            </div>
          </div>

          {/* Anotações Gerais */}
          <div>
            <label className="block text-zinc-400 mb-1 font-medium flex items-center gap-1.5">
              <FileText size={12} className="text-zinc-400" />
              <span>Anotações Gerais / Condições Comerciais</span>
            </label>
            <textarea
              rows={2}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="ex: Pedido mínimo de 30 camisetas; despacha via Jadlog no mesmo dia após Pix."
              className="w-full px-3 py-2 rounded-xl bg-zinc-900/80 border border-zinc-800 text-zinc-100 placeholder:text-zinc-600 focus:outline-none focus:border-zinc-700"
            />
          </div>

          {/* Footer */}
          <div className="pt-4 border-t border-zinc-800 flex items-center justify-end gap-2.5">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl bg-zinc-900 hover:bg-zinc-800 text-zinc-400 hover:text-zinc-200 transition cursor-pointer"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={isPending}
              className="px-5 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-zinc-950 font-bold transition shadow-sm flex items-center gap-2 cursor-pointer"
            >
              {isPending ? (
                <>
                  <Loader2 size={14} className="animate-spin" />
                  Salvando Fornecedor...
                </>
              ) : (
                <>
                  <Plus size={14} />
                  Salvar Fornecedor
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
