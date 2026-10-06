"use client";

import { useState, useTransition } from "react";
import { X, Shirt, Image as ImageIcon, Package, Tag, Loader2, Plus, Sparkles, Layers } from "lucide-react";
import { createRawItem, createBatchBlankShirts } from "@/actions/inventory";
import { RawItemType } from "@prisma/client";
import { toast } from "sonner";

interface NewRawItemModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCreated: () => void;
  initialType?: RawItemType;
}

const SHIRT_MODEL_SUGGESTIONS = [
  "Streetwear Oversized 26.1",
  "Casual 30.1 Penteada",
  "Heavyweight 28.1",
  "Moletom Canguru 3 Cabos",
  "Regata Oversized",
];

const SHIRT_COLOR_SUGGESTIONS = [
  "Preto",
  "Off-White",
  "Branco",
  "Marrom Cacau",
  "Verde Militar",
  "Cinza Mescla",
  "Vinho",
  "Azul Marinho",
];

export function NewRawItemModal({
  isOpen,
  onClose,
  onCreated,
  initialType = RawItemType.BLANK_SHIRT,
}: NewRawItemModalProps) {
  const [isPending, startTransition] = useTransition();

  const [category, setCategory] = useState<RawItemType>(initialType);

  // Campos Camiseta Lisa
  const [shirtModel, setShirtModel] = useState("Streetwear Oversized 26.1");
  const [shirtColor, setShirtColor] = useState("Preto");
  const [shirtSize, setShirtSize] = useState("M");
  const [isBatchSizes, setIsBatchSizes] = useState(false);
  const [batchQuantities, setBatchQuantities] = useState<Record<string, number>>({
    P: 0,
    M: 0,
    G: 0,
    GG: 0,
    XG: 0,
  });

  // Campos Gerais
  const [name, setName] = useState("");
  const [costPrice, setCostPrice] = useState<number>(24.50);
  const [stockQuantity, setStockQuantity] = useState<number>(0);
  const [minStock, setMinStock] = useState<number>(5);
  const [sku, setSku] = useState("");

  // Campos DTF
  const [dtfCode, setDtfCode] = useState("");
  const [dtfPrintSize, setDtfPrintSize] = useState("A3 (30x42cm)");
  const [dtfPreviewUrl, setDtfPreviewUrl] = useState("");
  const [dtfSupplier, setDtfSupplier] = useState("Birô DTF Express");

  if (!isOpen) return null;

  const handleCategoryChange = (newCat: RawItemType) => {
    setCategory(newCat);
    if (newCat === RawItemType.BLANK_SHIRT) {
      setCostPrice(24.50);
      setMinStock(5);
    } else if (newCat === RawItemType.DTF_PRINT) {
      setCostPrice(13.90);
      setMinStock(10);
    } else if (newCat === RawItemType.PACKAGING) {
      setCostPrice(1.85);
      setMinStock(30);
    } else {
      setCostPrice(0.65);
      setMinStock(50);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    startTransition(async () => {
      try {
        if (category === RawItemType.BLANK_SHIRT) {
          const modelName = shirtModel.trim() || "Camiseta Oversized";
          const colorName = shirtColor.trim() || "Preto";

          if (isBatchSizes) {
            // Cadastrar grade completa (P, M, G, GG, XG)
            const sizesToCreate = Object.entries(batchQuantities).map(([sz, qty]) => ({
              size: sz,
              quantity: Number(qty) || 0,
            }));

            await createBatchBlankShirts({
              model: modelName,
              color: colorName,
              costPrice: Number(costPrice) || 0,
              minStock: Number(minStock) || 5,
              sizes: sizesToCreate,
            });

            toast.success(`Grade completa de ${modelName} (${colorName}) cadastrada com sucesso!`);
          } else {
            // Cadastrar tamanho único
            const fullName = name.trim() || `${modelName} - ${colorName} ${shirtSize}`;
            await createRawItem({
              name: fullName,
              type: RawItemType.BLANK_SHIRT,
              shirtModel: modelName,
              shirtColor: colorName,
              shirtSize: shirtSize,
              costPrice: Number(costPrice) || 0,
              stockQuantity: Number(stockQuantity) || 0,
              minStock: Number(minStock) || 5,
              sku: sku.trim() || undefined,
            });

            toast.success(`Camiseta ${fullName} cadastrada no estoque!`);
          }
        } else if (category === RawItemType.DTF_PRINT) {
          const dtfName = name.trim() || (dtfCode ? `Estampa ${dtfCode}` : "Folha DTF Téxtil");
          await createRawItem({
            name: dtfName,
            type: RawItemType.DTF_PRINT,
            dtfCode: dtfCode.trim() || undefined,
            dtfPrintSize,
            dtfPreviewUrl: dtfPreviewUrl.trim() || undefined,
            dtfSupplier: dtfSupplier.trim() || undefined,
            costPrice: Number(costPrice) || 0,
            stockQuantity: Number(stockQuantity) || 0,
            minStock: Number(minStock) || 5,
            sku: sku.trim() || undefined,
          });

          toast.success(`Arte/Folha DTF "${dtfName}" cadastrada no estoque!`);
        } else {
          // Embalagem, Brinde ou Tag
          if (!name.trim()) {
            toast.error("Informe o nome do insumo.");
            return;
          }

          await createRawItem({
            name: name.trim(),
            type: category,
            costPrice: Number(costPrice) || 0,
            stockQuantity: Number(stockQuantity) || 0,
            minStock: Number(minStock) || 5,
            sku: sku.trim() || undefined,
          });

          toast.success(`Insumo "${name}" cadastrado no estoque!`);
        }

        onCreated();
        onClose();
      } catch (err: any) {
        toast.error("Erro ao cadastrar insumo: " + err.message);
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
              <Plus size={16} />
            </div>
            <div>
              <h3 className="text-sm font-bold text-zinc-100">
                Cadastrar Insumo / Matéria-Prima
              </h3>
              <p className="text-xs text-zinc-500">
                Adicione camisetas lisas, folhas DTF ou embalagens reais ao seu estoque.
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-zinc-400 hover:text-zinc-100 hover:bg-zinc-800 transition"
          >
            <X size={18} />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-5 overflow-y-auto flex-1 text-xs">
          {/* Categoria Selector */}
          <div>
            <label className="block text-zinc-400 mb-2 font-medium">Categoria do Insumo</label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              <button
                type="button"
                onClick={() => handleCategoryChange(RawItemType.BLANK_SHIRT)}
                className={`p-2.5 rounded-xl border flex flex-col items-center gap-1.5 transition text-center cursor-pointer ${
                  category === RawItemType.BLANK_SHIRT
                    ? "bg-zinc-800 border-zinc-600 text-zinc-100 font-semibold shadow-sm"
                    : "bg-zinc-900/50 border-zinc-800 text-zinc-400 hover:text-zinc-200"
                }`}
              >
                <Shirt size={16} />
                <span className="text-[11px]">Camiseta Lisa</span>
              </button>

              <button
                type="button"
                onClick={() => handleCategoryChange(RawItemType.DTF_PRINT)}
                className={`p-2.5 rounded-xl border flex flex-col items-center gap-1.5 transition text-center cursor-pointer ${
                  category === RawItemType.DTF_PRINT
                    ? "bg-zinc-800 border-zinc-600 text-zinc-100 font-semibold shadow-sm"
                    : "bg-zinc-900/50 border-zinc-800 text-zinc-400 hover:text-zinc-200"
                }`}
              >
                <ImageIcon size={16} />
                <span className="text-[11px]">DTF / Arte</span>
              </button>

              <button
                type="button"
                onClick={() => handleCategoryChange(RawItemType.PACKAGING)}
                className={`p-2.5 rounded-xl border flex flex-col items-center gap-1.5 transition text-center cursor-pointer ${
                  category === RawItemType.PACKAGING
                    ? "bg-zinc-800 border-zinc-600 text-zinc-100 font-semibold shadow-sm"
                    : "bg-zinc-900/50 border-zinc-800 text-zinc-400 hover:text-zinc-200"
                }`}
              >
                <Package size={16} />
                <span className="text-[11px]">Embalagem</span>
              </button>

              <button
                type="button"
                onClick={() => handleCategoryChange(RawItemType.LABEL)}
                className={`p-2.5 rounded-xl border flex flex-col items-center gap-1.5 transition text-center cursor-pointer ${
                  category === RawItemType.LABEL || category === RawItemType.GIFT
                    ? "bg-zinc-800 border-zinc-600 text-zinc-100 font-semibold shadow-sm"
                    : "bg-zinc-900/50 border-zinc-800 text-zinc-400 hover:text-zinc-200"
                }`}
              >
                <Tag size={16} />
                <span className="text-[11px]">Tag / Brinde</span>
              </button>
            </div>
          </div>

          {/* Campos específicos para Camiseta Lisa */}
          {category === RawItemType.BLANK_SHIRT && (
            <div className="space-y-4 p-4 rounded-xl bg-zinc-900/40 border border-zinc-800/80">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-zinc-400 mb-1">Modelo da Camiseta *</label>
                  <input
                    type="text"
                    required
                    value={shirtModel}
                    onChange={(e) => setShirtModel(e.target.value)}
                    placeholder="ex: Streetwear Oversized 26.1"
                    className="w-full px-3 py-2 rounded-xl bg-zinc-950 border border-zinc-800 text-zinc-100 placeholder:text-zinc-600 focus:outline-none focus:border-zinc-700"
                  />
                  <div className="flex flex-wrap gap-1 mt-1.5">
                    {SHIRT_MODEL_SUGGESTIONS.slice(0, 3).map((s) => (
                      <button
                        type="button"
                        key={s}
                        onClick={() => setShirtModel(s)}
                        className="text-[10px] px-2 py-0.5 rounded-md bg-zinc-900 hover:bg-zinc-800 text-zinc-400 hover:text-zinc-200 border border-zinc-800/60 transition"
                      >
                        {s}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-zinc-400 mb-1">Cor *</label>
                  <input
                    type="text"
                    required
                    value={shirtColor}
                    onChange={(e) => setShirtColor(e.target.value)}
                    placeholder="ex: Preto"
                    className="w-full px-3 py-2 rounded-xl bg-zinc-950 border border-zinc-800 text-zinc-100 placeholder:text-zinc-600 focus:outline-none focus:border-zinc-700"
                  />
                  <div className="flex flex-wrap gap-1 mt-1.5">
                    {SHIRT_COLOR_SUGGESTIONS.slice(0, 4).map((c) => (
                      <button
                        type="button"
                        key={c}
                        onClick={() => setShirtColor(c)}
                        className="text-[10px] px-2 py-0.5 rounded-md bg-zinc-900 hover:bg-zinc-800 text-zinc-400 hover:text-zinc-200 border border-zinc-800/60 transition"
                      >
                        {c}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Opção de Grade Completa vs Tamanho Único */}
              <div className="pt-2 border-t border-zinc-850">
                <div className="flex items-center justify-between mb-2">
                  <label className="flex items-center gap-2 cursor-pointer text-zinc-300">
                    <input
                      type="checkbox"
                      checked={isBatchSizes}
                      onChange={(e) => setIsBatchSizes(e.target.checked)}
                      className="rounded bg-zinc-950 border-zinc-800 text-amber-500 accent-amber-500"
                    />
                    <span className="font-semibold text-xs text-amber-400 flex items-center gap-1.5">
                      <Layers size={13} />
                      Cadastrar Grade Completa (P, M, G, GG, XG) de uma vez
                    </span>
                  </label>
                </div>

                {isBatchSizes ? (
                  <div className="space-y-1.5">
                    <span className="text-[11px] text-zinc-400 block mb-1">
                      Informe o estoque inicial de cada tamanho:
                    </span>
                    <div className="grid grid-cols-5 gap-2">
                      {["P", "M", "G", "GG", "XG"].map((sz) => (
                        <div key={sz} className="text-center">
                          <label className="block text-[10px] font-mono text-zinc-400 mb-1 font-bold">
                            Tam. {sz}
                          </label>
                          <input
                            type="number"
                            min={0}
                            value={batchQuantities[sz]}
                            onChange={(e) =>
                              setBatchQuantities((prev) => ({
                                ...prev,
                                [sz]: parseInt(e.target.value) || 0,
                              }))
                            }
                            className="w-full px-2 py-1.5 text-center font-mono rounded-lg bg-zinc-950 border border-zinc-800 text-zinc-100 text-xs focus:outline-none focus:border-zinc-700"
                          />
                        </div>
                      ))}
                    </div>
                  </div>
                ) : (
                  <div>
                    <label className="block text-zinc-400 mb-1">Tamanho da Peça</label>
                    <div className="grid grid-cols-5 gap-2">
                      {["P", "M", "G", "GG", "XG"].map((sz) => (
                        <button
                          type="button"
                          key={sz}
                          onClick={() => setShirtSize(sz)}
                          className={`py-1.5 rounded-lg text-xs font-mono font-bold transition border cursor-pointer ${
                            shirtSize === sz
                              ? "bg-amber-500 text-zinc-950 border-amber-400"
                              : "bg-zinc-950 text-zinc-400 border-zinc-800 hover:text-zinc-200"
                          }`}
                        >
                          {sz}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Campos específicos para DTF */}
          {category === RawItemType.DTF_PRINT && (
            <div className="space-y-3 p-4 rounded-xl bg-zinc-900/40 border border-zinc-800/80">
              <div>
                <label className="block text-zinc-400 mb-1">Nome / Identificação da Estampa *</label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="ex: Caveira Cyberpunk Costas"
                  className="w-full px-3 py-2 rounded-xl bg-zinc-950 border border-zinc-800 text-zinc-100 placeholder:text-zinc-600 focus:outline-none focus:border-zinc-700"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-zinc-400 mb-1">Tamanho da Folha/Estampa</label>
                  <select
                    value={dtfPrintSize}
                    onChange={(e) => {
                      setDtfPrintSize(e.target.value);
                      if (e.target.value.includes("A4")) setCostPrice(9.50);
                      else if (e.target.value.includes("Bolso")) setCostPrice(4.50);
                      else setCostPrice(13.90);
                    }}
                    className="w-full px-3 py-2 rounded-xl bg-zinc-950 border border-zinc-800 text-zinc-200 focus:outline-none focus:border-zinc-700"
                  >
                    <option value="A3 (30x42cm)">A3 (30x42cm) — Estampa Grande</option>
                    <option value="A4 (21x30cm)">A4 (21x30cm) — Estampa Média</option>
                    <option value="Bolso (10x10cm)">Bolso (10x10cm) — Logo Peito</option>
                  </select>
                </div>

                <div>
                  <label className="block text-zinc-400 mb-1">Código da Arte (Opcional)</label>
                  <input
                    type="text"
                    value={dtfCode}
                    onChange={(e) => setDtfCode(e.target.value)}
                    placeholder="ex: ART-01"
                    className="w-full px-3 py-2 rounded-xl bg-zinc-950 border border-zinc-800 text-zinc-100 placeholder:text-zinc-600 focus:outline-none focus:border-zinc-700"
                  />
                </div>
              </div>

              <div>
                <label className="block text-zinc-400 mb-1">Link do Arquivo ou Preview (Opcional)</label>
                <input
                  type="url"
                  value={dtfPreviewUrl}
                  onChange={(e) => setDtfPreviewUrl(e.target.value)}
                  placeholder="https://..."
                  className="w-full px-3 py-1.5 rounded-lg bg-zinc-950 border border-zinc-800 text-zinc-100 placeholder:text-zinc-600 font-mono text-[11px] focus:outline-none focus:border-zinc-700"
                />
              </div>
            </div>
          )}

          {/* Campos para Embalagens / Outros Insumos */}
          {(category === RawItemType.PACKAGING || category === RawItemType.LABEL || category === RawItemType.GIFT) && (
            <div className="space-y-3 p-4 rounded-xl bg-zinc-900/40 border border-zinc-800/80">
              <div>
                <label className="block text-zinc-400 mb-1">Nome do Insumo *</label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="ex: Saco Zip Lock Fosco 30x40cm"
                  className="w-full px-3 py-2 rounded-xl bg-zinc-950 border border-zinc-800 text-zinc-100 placeholder:text-zinc-600 focus:outline-none focus:border-zinc-700"
                />
              </div>
            </div>
          )}

          {/* Quantidades e Custos */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
            {!isBatchSizes && (
              <div>
                <label className="block text-zinc-400 mb-1">Quantidade Inicial</label>
                <input
                  type="number"
                  min={0}
                  value={stockQuantity}
                  onChange={(e) => setStockQuantity(parseInt(e.target.value) || 0)}
                  className="w-full px-3 py-2 rounded-xl bg-zinc-900/80 border border-zinc-800 text-zinc-100 font-mono text-center focus:outline-none focus:border-zinc-700"
                />
              </div>
            )}

            <div className={isBatchSizes ? "sm:col-span-2" : ""}>
              <label className="block text-zinc-400 mb-1">Custo Unitário (R$)</label>
              <input
                type="number"
                step="0.05"
                min={0}
                value={costPrice}
                onChange={(e) => setCostPrice(parseFloat(e.target.value) || 0)}
                className="w-full px-3 py-2 rounded-xl bg-zinc-900/80 border border-zinc-800 text-zinc-100 font-mono text-center focus:outline-none focus:border-zinc-700"
              />
            </div>

            <div>
              <label className="block text-zinc-400 mb-1">Estoque Mínimo (Alerta)</label>
              <input
                type="number"
                min={1}
                value={minStock}
                onChange={(e) => setMinStock(parseInt(e.target.value) || 5)}
                className="w-full px-3 py-2 rounded-xl bg-zinc-900/80 border border-zinc-800 text-zinc-100 font-mono text-center focus:outline-none focus:border-zinc-700"
              />
            </div>
          </div>

          {/* Footer Action */}
          <div className="pt-3 border-t border-zinc-800 flex items-center justify-end gap-2.5">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl bg-zinc-900 hover:bg-zinc-800 text-zinc-400 hover:text-zinc-200 transition"
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
                  Salvando Insumo...
                </>
              ) : (
                <>
                  <Plus size={14} />
                  Salvar no Estoque
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
