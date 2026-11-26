import { useMemo, useState } from 'react';
import {
  ArrowDownLeft,
  ArrowUpRight,
  Ban,
  Car,
  ChevronLeft,
  CreditCard,
  Eye,
  EyeOff,
  FileText,
  Flame,
  Heart,
  Landmark,
  MapPin,
  MessageCircle,
  Navigation,
  Package,
  Radio,
  Receipt,
  Send,
  ShoppingBag,
  Sparkles,
  User,
  WifiOff,
} from 'lucide-react';
import { chapterAudio } from '../../game/audio';
import {
  BANK_ACCOUNT_SUMMARY,
  ECOSYSTEM_CARD_INSTALLMENTS,
  ECOSYSTEM_DATING_MATCHES,
  ECOSYSTEM_MAP_PLACES,
  ECOSYSTEM_MARKETPLACE,
  ECOSYSTEM_RIDES,
  ECOSYSTEM_SOCIAL_DMS,
  ECOSYSTEM_SOCIAL_POSTS,
  ECOSYSTEM_TRANSACTIONS,
  LETICIA_PORTRAIT_TOKEN,
  formatBRL,
  type BankTransaction,
  type DatingMatchRecord,
  type MapPlaceRecord,
  type MarketplaceOrder,
  type SocialDmRecord,
} from '../../game/phoneEcosystem';
import evidenceLeticiaPortrait from '../../assets/images/evidence_leticia_portrait.jpg';
import type { OsDeepLink } from './OsTypes';

function resolveSocialImageSrc(src?: string): string | undefined {
  if (!src) return undefined;
  return src === LETICIA_PORTRAIT_TOKEN ? evidenceLeticiaPortrait : src;
}

// ============================================================================
// BANCO ÁUREA (Saldo, Extrato filtrável, Comprovante Pix, Cartão / Fatura)
// ============================================================================

export function BankApp({
  initialTxId,
  offline,
  onNavigate,
  onBackHome,
}: {
  initialTxId?: string;
  offline: boolean;
  onNavigate: (link: OsDeepLink) => void;
  onBackHome: () => void;
}) {
  const [tab, setTab] = useState<'statement' | 'card'>('statement');
  const [filter, setFilter] = useState<'all' | 'in' | 'out'>('all');
  const [hideBalance, setHideBalance] = useState(false);
  const [selectedTx, setSelectedTx] = useState<BankTransaction | null>(
    () => ECOSYSTEM_TRANSACTIONS.find((t) => t.id === initialTxId) ?? null
  );

  const visibleTx = useMemo(() => {
    if (filter === 'all') return ECOSYSTEM_TRANSACTIONS;
    return ECOSYSTEM_TRANSACTIONS.filter((t) => t.direction === filter);
  }, [filter]);

  return (
    <div data-testid="app-bank" className="flex min-h-0 flex-1 flex-col bg-[#0b0c10]">
      <div className="flex items-center justify-between border-b border-white/10 px-3 py-2.5">
        <div className="flex items-center gap-1.5">
          <button
            type="button"
            onClick={() => {
              chapterAudio.playUiTap();
              if (selectedTx) {
                setSelectedTx(null);
              } else {
                onBackHome();
              }
            }}
            aria-label="Voltar"
            className="flex h-8 w-8 items-center justify-center rounded-full text-zinc-300 hover:bg-white/10"
          >
            <ChevronLeft className="h-5 w-5" />
          </button>
          <div>
            <h2 className="text-sm font-semibold text-zinc-100">
              {selectedTx ? 'Comprovante' : BANK_ACCOUNT_SUMMARY.bankName}
            </h2>
            {!selectedTx && (
              <p className="font-mono text-[10px] text-zinc-500">
                Ag {BANK_ACCOUNT_SUMMARY.agency} · Cc {BANK_ACCOUNT_SUMMARY.account}
              </p>
            )}
          </div>
        </div>
        {!selectedTx && (
          <button
            type="button"
            onClick={() => {
              chapterAudio.playUiTap();
              setHideBalance((v) => !v);
            }}
            aria-label={hideBalance ? 'Mostrar saldo' : 'Ocultar saldo'}
            className="flex h-8 w-8 items-center justify-center rounded-full text-zinc-400 hover:bg-white/10 hover:text-zinc-100"
          >
            {hideBalance ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
          </button>
        )}
      </div>

      {offline && (
        <div className="flex items-center gap-2 border-b border-amber-500/20 bg-amber-950/35 px-3.5 py-1.5 text-[11px] text-amber-200/90">
          <WifiOff className="h-3.5 w-3.5 shrink-0" />
          <span>Sem conexão · exibindo extrato sincronizado em cache.</span>
        </div>
      )}

      {selectedTx ? (
        <div className="flex-1 space-y-3 overflow-y-auto px-4 py-4">
          <div className="rounded-2xl border border-white/10 bg-[#15171c] p-4">
            <div className="flex items-center justify-between">
              <span className="rounded-md bg-white/8 px-2 py-0.5 text-[10px] font-medium text-zinc-300">
                {selectedTx.category}
              </span>
              <span className="font-mono text-[10px] text-zinc-500">
                {selectedTx.dateLabel} · {selectedTx.timeLabel}
              </span>
            </div>
            <p
              className={`mt-3 font-mono text-2xl font-semibold tabular-nums ${
                selectedTx.direction === 'in' ? 'text-emerald-400' : 'text-zinc-100'
              }`}
            >
              {selectedTx.direction === 'in' ? '+' : '-'} {formatBRL(selectedTx.amount)}
            </p>
            <p className="mt-1 text-xs font-medium text-zinc-200">
              {selectedTx.counterparty}
            </p>
            <p className="mt-0.5 text-xs text-zinc-400">{selectedTx.description}</p>
          </div>

          <div className="divide-y divide-white/5 rounded-2xl border border-white/10 bg-[#15171c] px-4 text-xs">
            <div className="flex justify-between py-2.5">
              <span className="text-zinc-500">Instituição</span>
              <span className="text-zinc-200">{selectedTx.bankLabel}</span>
            </div>
            <div className="flex justify-between py-2.5">
              <span className="text-zinc-500">Documento</span>
              <span className="font-mono text-zinc-200">{selectedTx.documentMask}</span>
            </div>
            <div className="flex justify-between py-2.5">
              <span className="text-zinc-500">Autenticação</span>
              <span className="font-mono text-[11px] text-zinc-300">
                {selectedTx.receiptCode}
              </span>
            </div>
          </div>

          <div className="flex flex-wrap gap-2">
            {selectedTx.personId && (
              <button
                type="button"
                onClick={() => {
                  chapterAudio.playUiTap();
                  onNavigate({ appId: 'phone', targetId: selectedTx.personId });
                }}
                className="flex items-center gap-1.5 rounded-xl border border-white/10 bg-[#15171c] px-3 py-2 text-xs text-zinc-200 hover:border-white/25"
              >
                <User className="h-3.5 w-3.5 text-zinc-400" />
                Ver contato
              </button>
            )}
            {selectedTx.id === 'tx-1' && (
              <button
                type="button"
                onClick={() => {
                  chapterAudio.playUiTap();
                  onNavigate({ appId: 'files', targetId: 'file-pix-18nov' });
                }}
                className="flex items-center gap-1.5 rounded-xl border border-white/10 bg-[#15171c] px-3 py-2 text-xs text-zinc-200 hover:border-white/25"
              >
                <FileText className="h-3.5 w-3.5 text-zinc-400" />
                Abrir PDF salvo
              </button>
            )}
            {selectedTx.id === 'tx-4' && (
              <button
                type="button"
                onClick={() => {
                  chapterAudio.playUiTap();
                  onNavigate({ appId: 'market', targetId: 'ord-ml-9042' });
                }}
                className="flex items-center gap-1.5 rounded-xl border border-white/10 bg-[#15171c] px-3 py-2 text-xs text-zinc-200 hover:border-white/25"
              >
                <ShoppingBag className="h-3.5 w-3.5 text-zinc-400" />
                Ver pedido ML-9042
              </button>
            )}
          </div>
        </div>
      ) : (
        <div className="flex min-h-0 flex-1 flex-col">
          {/* Account Balance Card */}
          <div className="px-3.5 pt-3 pb-2">
            <div className="rounded-2xl border border-white/10 bg-gradient-to-br from-[#191c24] to-[#111319] p-4 shadow-lg">
              <div className="flex items-center justify-between text-[11px] text-zinc-400">
                <span className="flex items-center gap-1.5">
                  <Landmark className="h-3.5 w-3.5 text-[#D8C7B3]" />
                  Saldo em conta
                </span>
                <span className="font-mono text-[10px] text-zinc-500">Letícia V.</span>
              </div>
              <p className="mt-1.5 font-mono text-2xl font-semibold tracking-tight text-zinc-100 tabular-nums">
                {hideBalance ? 'R$ ••••••' : formatBRL(BANK_ACCOUNT_SUMMARY.balance)}
              </p>

              <div className="mt-3 flex gap-2">
                <button
                  type="button"
                  onClick={() => {
                    chapterAudio.playUiTap();
                    setTab('statement');
                  }}
                  className={`flex-1 rounded-xl py-1.5 text-xs font-medium transition-colors ${
                    tab === 'statement'
                      ? 'bg-[#D8C7B3] text-zinc-950'
                      : 'bg-white/8 text-zinc-300 hover:bg-white/12'
                  }`}
                >
                  Extrato
                </button>
                <button
                  type="button"
                  onClick={() => {
                    chapterAudio.playUiTap();
                    setTab('card');
                  }}
                  className={`flex-1 rounded-xl py-1.5 text-xs font-medium transition-colors ${
                    tab === 'card'
                      ? 'bg-[#D8C7B3] text-zinc-950'
                      : 'bg-white/8 text-zinc-300 hover:bg-white/12'
                  }`}
                >
                  Cartão
                </button>
              </div>
            </div>
          </div>

          {tab === 'statement' ? (
            <>
              <div className="flex items-center gap-1.5 px-3.5 pb-2">
                {(
                  [
                    ['all', 'Todos'],
                    ['out', 'Saídas'],
                    ['in', 'Entradas'],
                  ] as const
                ).map(([key, label]) => (
                  <button
                    key={key}
                    type="button"
                    onClick={() => {
                      chapterAudio.playUiTap();
                      setFilter(key);
                    }}
                    className={`rounded-full px-3 py-1 text-[11px] font-medium ${
                      filter === key
                        ? 'bg-zinc-200 text-zinc-950'
                        : 'bg-white/6 text-zinc-400 hover:text-zinc-200'
                    }`}
                  >
                    {label}
                  </button>
                ))}
              </div>

              <div className="flex-1 divide-y divide-white/5 overflow-y-auto px-3.5 pb-4">
                {visibleTx.map((tx) => (
                  <button
                    key={tx.id}
                    type="button"
                    data-testid={`bank-tx-${tx.id}`}
                    onClick={() => {
                      chapterAudio.playUiTap();
                      setSelectedTx(tx);
                    }}
                    className="flex w-full items-center gap-3 py-3 text-left transition-colors hover:bg-white/4"
                  >
                    <span
                      className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-xl ${
                        tx.direction === 'in'
                          ? 'bg-emerald-950/80 text-emerald-300'
                          : 'bg-zinc-800/90 text-zinc-300'
                      }`}
                    >
                      {tx.direction === 'in' ? (
                        <ArrowDownLeft className="h-4 w-4" />
                      ) : (
                        <ArrowUpRight className="h-4 w-4" />
                      )}
                    </span>
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-xs font-medium text-zinc-100">
                        {tx.counterparty}
                      </p>
                      <p className="truncate text-[11px] text-zinc-400">
                        {tx.category} · {tx.description}
                      </p>
                    </div>
                    <div className="shrink-0 text-right">
                      <p
                        className={`font-mono text-xs font-semibold tabular-nums ${
                          tx.direction === 'in' ? 'text-emerald-400' : 'text-zinc-100'
                        }`}
                      >
                        {tx.direction === 'in' ? '+' : '-'} {formatBRL(tx.amount)}
                      </p>
                      <p className="font-mono text-[10px] text-zinc-500">
                        {tx.dateLabel} · {tx.timeLabel}
                      </p>
                    </div>
                  </button>
                ))}
              </div>
            </>
          ) : (
            <div className="flex-1 space-y-3 overflow-y-auto px-3.5 pt-1 pb-4">
              <div className="rounded-2xl border border-white/10 bg-[#15171c] p-3.5">
                <div className="flex items-center justify-between text-xs text-zinc-400">
                  <span className="flex items-center gap-1.5">
                    <CreditCard className="h-4 w-4 text-[#D8C7B3]" />
                    Cartão Áurea final 4092
                  </span>
                  <span className="font-mono text-[10px]">
                    Venc. {BANK_ACCOUNT_SUMMARY.cardDueDate}
                  </span>
                </div>
                <p className="mt-2 font-mono text-xl font-semibold text-zinc-100 tabular-nums">
                  {formatBRL(BANK_ACCOUNT_SUMMARY.cardInvoiceCurrent)}
                </p>
                <p className="mt-0.5 text-[11px] text-zinc-500">
                  Limite disponível:{' '}
                  {formatBRL(
                    BANK_ACCOUNT_SUMMARY.cardLimitTotal -
                      BANK_ACCOUNT_SUMMARY.cardInvoiceCurrent
                  )}
                </p>
              </div>

              <div>
                <p className="mb-2 text-[10px] font-medium tracking-wider text-zinc-500 uppercase">
                  Lançamentos e parcelas
                </p>
                <div className="divide-y divide-white/5 rounded-2xl border border-white/10 bg-[#15171c]">
                  {ECOSYSTEM_CARD_INSTALLMENTS.map((item) => (
                    <div
                      key={item.id}
                      className="flex items-center justify-between px-3.5 py-2.5"
                    >
                      <div className="min-w-0">
                        <p className="truncate text-xs font-medium text-zinc-100">
                          {item.merchant}
                        </p>
                        <p className="text-[11px] text-zinc-500">
                          {item.dateLabel} · {item.category} · {item.installmentLabel}
                        </p>
                      </div>
                      <span className="font-mono text-xs text-zinc-200 tabular-nums">
                        {formatBRL(item.amount)}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

// ============================================================================
// MERCADOLOCAL (Compras, Vendas, Chat comprador/vendedor, Rastreamento)
// ============================================================================

export function MarketplaceApp({
  initialOrderId,
  offline,
  onNavigate,
  onBackHome,
}: {
  initialOrderId?: string;
  offline: boolean;
  onNavigate: (link: OsDeepLink) => void;
  onBackHome: () => void;
}) {
  const [filter, setFilter] = useState<'all' | 'sale' | 'purchase'>('all');
  const [selectedOrder, setSelectedOrder] = useState<MarketplaceOrder | null>(
    () => ECOSYSTEM_MARKETPLACE.find((o) => o.id === initialOrderId) ?? null
  );

  const visibleOrders = useMemo(() => {
    if (filter === 'all') return ECOSYSTEM_MARKETPLACE;
    return ECOSYSTEM_MARKETPLACE.filter((o) => o.kind === filter);
  }, [filter]);

  return (
    <div data-testid="app-market" className="flex min-h-0 flex-1 flex-col bg-[#0c0d11]">
      <div className="flex items-center gap-1.5 border-b border-white/10 px-3 py-2.5">
        <button
          type="button"
          onClick={() => {
            chapterAudio.playUiTap();
            if (selectedOrder) {
              setSelectedOrder(null);
            } else {
              onBackHome();
            }
          }}
          aria-label="Voltar"
          className="flex h-8 w-8 items-center justify-center rounded-full text-zinc-300 hover:bg-white/10"
        >
          <ChevronLeft className="h-5 w-5" />
        </button>
        <h2 className="text-sm font-semibold text-zinc-100">
          {selectedOrder ? `Pedido ${selectedOrder.id.replace('ord-', '').toUpperCase()}` : 'MercadoLocal'}
        </h2>
      </div>

      {offline && (
        <div className="flex items-center gap-2 border-b border-amber-500/20 bg-amber-950/35 px-3.5 py-1.5 text-[11px] text-amber-200/90">
          <WifiOff className="h-3.5 w-3.5 shrink-0" />
          <span>Sem internet · exibindo pedidos salvos no aparelho.</span>
        </div>
      )}

      {selectedOrder ? (
        <div className="flex-1 space-y-3 overflow-y-auto px-3.5 py-3.5">
          <div className="rounded-2xl border border-white/10 bg-[#15171c] p-3.5">
            <div className="flex items-center justify-between gap-2">
              <span className="rounded-md bg-white/8 px-2 py-0.5 text-[10px] font-medium text-zinc-300">
                {selectedOrder.kind === 'sale' ? 'Venda' : 'Compra'}
              </span>
              <span className="text-[11px] text-emerald-400">
                {selectedOrder.status}
              </span>
            </div>
            <h3 className="mt-2 text-sm font-semibold text-zinc-100">
              {selectedOrder.itemTitle}
            </h3>
            <p className="mt-1 font-mono text-base font-semibold text-[#D8C7B3] tabular-nums">
              {formatBRL(selectedOrder.price)}
            </p>
            <div className="mt-3 space-y-1.5 border-t border-white/8 pt-2.5 text-xs text-zinc-400">
              <p>
                <span className="text-zinc-500">
                  {selectedOrder.kind === 'sale' ? 'Comprador: ' : 'Loja: '}
                </span>
                <span className="text-zinc-200">
                  {selectedOrder.counterpartyName} ({selectedOrder.counterpartyHandle})
                </span>
              </p>
              <p>
                <span className="text-zinc-500">Entrega / Retirada: </span>
                <span className="text-zinc-200">{selectedOrder.pickupOrAddress}</span>
              </p>
              {selectedOrder.trackingCode && (
                <p>
                  <span className="text-zinc-500">Rastreio: </span>
                  <span className="font-mono text-zinc-300">
                    {selectedOrder.trackingCode}
                  </span>
                </p>
              )}
            </div>
          </div>

          <div className="flex flex-wrap gap-2">
            {selectedOrder.id === 'ord-ml-9042' && (
              <>
                <button
                  type="button"
                  onClick={() => {
                    chapterAudio.playUiTap();
                    onNavigate({ appId: 'maps', targetId: 'place-galpao' });
                  }}
                  className="flex items-center gap-1.5 rounded-xl border border-white/10 bg-[#15171c] px-3 py-2 text-xs text-zinc-200 hover:border-white/25"
                >
                  <MapPin className="h-3.5 w-3.5 text-zinc-400" />
                  Abrir no Mapas
                </button>
                <button
                  type="button"
                  onClick={() => {
                    chapterAudio.playUiTap();
                    onNavigate({ appId: 'bank', targetId: 'tx-4' });
                  }}
                  className="flex items-center gap-1.5 rounded-xl border border-white/10 bg-[#15171c] px-3 py-2 text-xs text-zinc-200 hover:border-white/25"
                >
                  <Receipt className="h-3.5 w-3.5 text-zinc-400" />
                  Ver Pix recebido
                </button>
              </>
            )}
          </div>

          <div className="space-y-2">
            <p className="text-[10px] font-medium tracking-wider text-zinc-500 uppercase">
              Mensagens da negociação
            </p>
            <div className="space-y-2 rounded-2xl border border-white/10 bg-[#15171c] p-3">
              {selectedOrder.chatMessages.map((msg) => (
                <div
                  key={msg.id}
                  className={`flex flex-col ${
                    msg.from === 'leticia' ? 'items-end' : 'items-start'
                  }`}
                >
                  <div
                    className={`max-w-[85%] rounded-2xl px-3 py-2 text-xs leading-relaxed ${
                      msg.from === 'leticia'
                        ? 'bg-zinc-200 text-zinc-950'
                        : 'bg-zinc-800/90 text-zinc-200'
                    }`}
                  >
                    {msg.text}
                  </div>
                  <span className="mt-0.5 font-mono text-[9.5px] text-zinc-500">
                    {msg.time}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      ) : (
        <div className="flex min-h-0 flex-1 flex-col">
          <div className="flex gap-1.5 px-3.5 py-2.5">
            {(
              [
                ['all', 'Todos'],
                ['sale', 'Vendas'],
                ['purchase', 'Compras'],
              ] as const
            ).map(([k, label]) => (
              <button
                key={k}
                type="button"
                onClick={() => {
                  chapterAudio.playUiTap();
                  setFilter(k);
                }}
                className={`rounded-full px-3 py-1 text-[11px] font-medium ${
                  filter === k
                    ? 'bg-zinc-200 text-zinc-950'
                    : 'bg-white/6 text-zinc-400 hover:text-zinc-200'
                }`}
              >
                {label}
              </button>
            ))}
          </div>

          <div className="flex-1 space-y-2.5 overflow-y-auto px-3.5 pb-4">
            {visibleOrders.map((order) => (
              <button
                key={order.id}
                type="button"
                data-testid={`market-order-${order.id}`}
                onClick={() => {
                  chapterAudio.playUiTap();
                  setSelectedOrder(order);
                }}
                className="w-full rounded-2xl border border-white/10 bg-[#15171c] p-3.5 text-left hover:border-white/20"
              >
                <div className="flex items-center justify-between text-[11px]">
                  <span className="flex items-center gap-1 text-zinc-400">
                    <Package className="h-3.5 w-3.5 text-amber-300/80" />
                    {order.kind === 'sale' ? 'Venda' : 'Compra'} · {order.dateLabel}
                  </span>
                  <span className="text-emerald-400">{order.status}</span>
                </div>
                <p className="mt-1.5 text-xs font-semibold text-zinc-100">
                  {order.itemTitle}
                </p>
                <div className="mt-2 flex items-center justify-between text-[11px]">
                  <span className="truncate text-zinc-400">
                    {order.counterpartyName} ({order.counterpartyHandle})
                  </span>
                  <span className="shrink-0 font-mono font-semibold text-zinc-200">
                    {formatBRL(order.price)}
                  </span>
                </div>
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

// ============================================================================
// MAPAS & ROTAGO (Mapa interativo SVG + Pontos salvos + Corridas RotaGo)
// ============================================================================

export function MapsApp({
  initialPlaceId,
  offline,
  onNavigate,
  onBackHome,
}: {
  initialPlaceId?: string;
  offline: boolean;
  onNavigate: (link: OsDeepLink) => void;
  onBackHome: () => void;
}) {
  const [tab, setTab] = useState<'map' | 'rides'>('map');
  const [selectedPlace, setSelectedPlace] = useState<MapPlaceRecord>(
    () =>
      ECOSYSTEM_MAP_PLACES.find((p) => p.id === initialPlaceId) ??
      ECOSYSTEM_MAP_PLACES[3]
  );

  return (
    <div data-testid="app-maps" className="flex min-h-0 flex-1 flex-col bg-[#0c0e13]">
      <div className="flex items-center justify-between border-b border-white/10 px-3 py-2.5">
        <div className="flex items-center gap-1.5">
          <button
            type="button"
            onClick={() => {
              chapterAudio.playUiTap();
              onBackHome();
            }}
            aria-label="Voltar"
            className="flex h-8 w-8 items-center justify-center rounded-full text-zinc-300 hover:bg-white/10"
          >
            <ChevronLeft className="h-5 w-5" />
          </button>
          <h2 className="text-sm font-semibold text-zinc-100">
            {tab === 'map' ? 'Mapas' : 'RotaGo · Corridas'}
          </h2>
        </div>

        <div className="flex rounded-full bg-white/8 p-0.5 text-[11px]">
          <button
            type="button"
            data-testid="maps-tab-map"
            onClick={() => {
              chapterAudio.playUiTap();
              setTab('map');
            }}
            className={`rounded-full px-2.5 py-1 font-medium ${
              tab === 'map' ? 'bg-zinc-200 text-zinc-950' : 'text-zinc-400'
            }`}
          >
            Mapa
          </button>
          <button
            type="button"
            data-testid="maps-tab-rides"
            onClick={() => {
              chapterAudio.playUiTap();
              setTab('rides');
            }}
            className={`rounded-full px-2.5 py-1 font-medium ${
              tab === 'rides' ? 'bg-zinc-200 text-zinc-950' : 'text-zinc-400'
            }`}
          >
            RotaGo
          </button>
        </div>
      </div>

      {offline && (
        <div className="flex items-center gap-2 border-b border-amber-500/20 bg-amber-950/35 px-3.5 py-1.5 text-[11px] text-amber-200/90">
          <WifiOff className="h-3.5 w-3.5 shrink-0" />
          <span>Mapa offline · somente pontos e rotas já armazenados.</span>
        </div>
      )}

      {tab === 'map' ? (
        <div className="flex min-h-0 flex-1 flex-col overflow-y-auto">
          {/* Interactive Dark Cartographic SVG Map */}
          <div className="relative mx-3 mt-3 h-48 shrink-0 overflow-hidden rounded-2xl border border-white/12 bg-[#11151d]">
            <svg
              viewBox="0 0 100 72"
              preserveAspectRatio="none"
              className="h-full w-full"
              role="img"
              aria-label="Mapa esquemático de locais recentes de Letícia"
            >
              {/* Grid lines */}
              <path
                d="M0 18 H100 M0 36 H100 M0 54 H100 M20 0 V72 M40 0 V72 M60 0 V72 M80 0 V72"
                stroke="rgba(255,255,255,0.04)"
                strokeWidth="0.4"
              />
              {/* Urban roads */}
              <path
                d="M6 66 L30 56 L46 46 L68 38 L86 18"
                fill="none"
                stroke="rgba(216,199,179,0.28)"
                strokeWidth="1.2"
                strokeDasharray="2.2 1.4"
              />
              <path
                d="M12 42 L44 46 L72 52 L96 44"
                fill="none"
                stroke="rgba(255,255,255,0.12)"
                strokeWidth="0.9"
              />
              <path
                d="M28 58 L38 22 L64 12"
                fill="none"
                stroke="rgba(255,255,255,0.09)"
                strokeWidth="0.7"
              />
              {/* Signal-loss zone halo around Km 14 */}
              <circle
                cx="82"
                cy="20"
                r="9"
                fill="rgba(117,43,50,0.26)"
                stroke="rgba(181,74,84,0.45)"
                strokeWidth="0.5"
                strokeDasharray="1.5 1.2"
              />
            </svg>

            {/* Clickable Map Pins */}
            {ECOSYSTEM_MAP_PLACES.map((place) => {
              const active = selectedPlace.id === place.id;
              const isNoSignal = place.category === 'Sem sinal';
              return (
                <button
                  key={place.id}
                  type="button"
                  data-testid={`map-pin-${place.id}`}
                  aria-label={`Selecionar ${place.name}`}
                  onClick={() => {
                    chapterAudio.playUiTap();
                    setSelectedPlace(place);
                  }}
                  style={{
                    left: `${place.x}%`,
                    top: `${(place.y / 72) * 100}%`,
                  }}
                  className={`absolute -translate-x-1/2 -translate-y-1/2 rounded-full p-1.5 transition-transform ${
                    active ? 'scale-125 ring-2 ring-white/70' : 'opacity-90 hover:scale-110'
                  } ${
                    isNoSignal
                      ? 'bg-[#752B32] text-rose-100'
                      : 'bg-zinc-200 text-zinc-950'
                  }`}
                >
                  {isNoSignal ? (
                    <Radio className="h-3 w-3" />
                  ) : (
                    <MapPin className="h-3 w-3" />
                  )}
                </button>
              );
            })}

            <div className="pointer-events-none absolute right-2.5 bottom-2 rounded-md bg-black/65 px-2 py-0.5 font-mono text-[9px] text-zinc-400">
              SP · Região Oeste / Zona Rural
            </div>
          </div>

          {/* Selected Place Card */}
          <div className="mx-3 mt-3 rounded-2xl border border-white/10 bg-[#15171c] p-3.5">
            <div className="flex items-start justify-between gap-2">
              <div>
                <p className="text-xs font-semibold text-zinc-100">
                  {selectedPlace.name}
                </p>
                <p className="mt-0.5 text-[11px] text-zinc-400">
                  {selectedPlace.address}
                </p>
              </div>
              <span
                className={`shrink-0 rounded-md px-2 py-0.5 text-[10px] font-medium ${
                  selectedPlace.category === 'Sem sinal'
                    ? 'bg-[#752B32]/40 text-rose-200'
                    : 'bg-white/8 text-zinc-300'
                }`}
              >
                {selectedPlace.category}
              </span>
            </div>
            <p className="mt-2 font-mono text-[10.5px] text-zinc-400">
              Último registro: {selectedPlace.lastVisit}
            </p>
            {selectedPlace.note && (
              <p className="mt-1 text-[11px] text-zinc-300">{selectedPlace.note}</p>
            )}
            {selectedPlace.id === 'place-km14' && (
              <button
                type="button"
                onClick={() => {
                  chapterAudio.playUiTap();
                  setTab('rides');
                }}
                className="mt-2.5 flex items-center gap-1.5 rounded-xl bg-white/8 px-3 py-1.5 text-[11px] font-medium text-zinc-200 hover:bg-white/14"
              >
                <Navigation className="h-3.5 w-3.5" />
                Ver corrida RotaGo para este destino
              </button>
            )}
          </div>

          {/* Places List */}
          <div className="space-y-1.5 px-3 py-3">
            <p className="text-[10px] font-medium tracking-wider text-zinc-500 uppercase">
              Favoritos e recentes
            </p>
            {ECOSYSTEM_MAP_PLACES.map((place) => (
              <button
                key={place.id}
                type="button"
                onClick={() => {
                  chapterAudio.playUiTap();
                  setSelectedPlace(place);
                }}
                className={`flex w-full items-center justify-between rounded-xl border px-3 py-2 text-left transition-colors ${
                  selectedPlace.id === place.id
                    ? 'border-white/25 bg-white/10'
                    : 'border-white/6 bg-[#15171c]/70 hover:bg-white/6'
                }`}
              >
                <div className="min-w-0">
                  <p className="truncate text-xs font-medium text-zinc-100">
                    {place.name}
                  </p>
                  <p className="truncate text-[10.5px] text-zinc-500">
                    {place.lastVisit}
                  </p>
                </div>
                <MapPin className="h-3.5 w-3.5 shrink-0 text-zinc-400" />
              </button>
            ))}
          </div>
        </div>
      ) : (
        <div className="flex-1 space-y-2.5 overflow-y-auto px-3.5 py-3">
          {ECOSYSTEM_RIDES.map((ride) => (
            <div
              key={ride.id}
              data-testid={`ride-card-${ride.id}`}
              className="rounded-2xl border border-white/10 bg-[#15171c] p-3.5"
            >
              <div className="flex items-center justify-between text-[11px]">
                <span className="flex items-center gap-1.5 font-mono text-zinc-400">
                  <Car className="h-3.5 w-3.5 text-zinc-300" />
                  {ride.dateLabel} · {ride.timeLabel}
                </span>
                <span className="font-mono font-semibold text-zinc-100">
                  {formatBRL(ride.fare)}
                </span>
              </div>

              <div className="mt-2.5 space-y-1 text-xs">
                <p className="text-zinc-400">
                  <span className="text-zinc-500">De: </span>
                  {ride.origin}
                </p>
                <p className="font-medium text-zinc-100">
                  <span className="font-normal text-zinc-500">Para: </span>
                  {ride.destination}
                </p>
              </div>

              <div className="mt-2.5 flex items-center justify-between border-t border-white/8 pt-2 text-[10.5px]">
                <span className="text-zinc-400">
                  {ride.driverName} · {ride.carLabel}
                </span>
                <span
                  className={
                    ride.status === 'Finalizada'
                      ? 'text-emerald-400'
                      : 'text-amber-300'
                  }
                >
                  {ride.status}
                </span>
              </div>

              {ride.note && (
                <p className="mt-2 rounded-lg bg-black/35 px-2.5 py-1.5 text-[11px] text-zinc-300">
                  {ride.note}
                </p>
              )}

              {ride.id === 'ride-1' && (
                <button
                  type="button"
                  onClick={() => {
                    chapterAudio.playUiTap();
                    onNavigate({ appId: 'bank', targetId: 'tx-2' });
                  }}
                  className="mt-2 text-[11px] font-medium text-[#D8C7B3] hover:underline"
                >
                  Ver cobrança no Banco Áurea →
                </button>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ============================================================================
// LUME (Rede Social — Feed, Perfil @leticiavasc, Mensagens Diretas)
// ============================================================================

export function SocialApp({
  offline,
  onNavigate,
  onBackHome,
}: {
  offline: boolean;
  onNavigate: (link: OsDeepLink) => void;
  onBackHome: () => void;
}) {
  const [tab, setTab] = useState<'feed' | 'profile' | 'dms'>('feed');
  const [likedIds, setLikedIds] = useState<Record<string, boolean>>({});
  const [selectedDm, setSelectedDm] = useState<SocialDmRecord | null>(null);

  return (
    <div data-testid="app-social" className="flex min-h-0 flex-1 flex-col bg-[#0b0c10]">
      <div className="flex items-center justify-between border-b border-white/10 px-3 py-2.5">
        <div className="flex items-center gap-1.5">
          <button
            type="button"
            onClick={() => {
              chapterAudio.playUiTap();
              if (selectedDm) {
                setSelectedDm(null);
              } else {
                onBackHome();
              }
            }}
            aria-label="Voltar"
            className="flex h-8 w-8 items-center justify-center rounded-full text-zinc-300 hover:bg-white/10"
          >
            <ChevronLeft className="h-5 w-5" />
          </button>
          <h2 className="text-sm font-semibold tracking-wide text-zinc-100">
            {selectedDm ? selectedDm.handle : 'Lume'}
          </h2>
        </div>

        {!selectedDm && (
          <div className="flex items-center gap-1">
            {(
              [
                ['feed', 'Feed'],
                ['profile', 'Perfil'],
                ['dms', 'DMs'],
              ] as const
            ).map(([k, label]) => (
              <button
                key={k}
                type="button"
                onClick={() => {
                  chapterAudio.playUiTap();
                  setTab(k);
                }}
                className={`rounded-full px-2.5 py-1 text-[11px] font-medium ${
                  tab === k ? 'bg-zinc-200 text-zinc-950' : 'text-zinc-400'
                }`}
              >
                {label}
              </button>
            ))}
          </div>
        )}
      </div>

      {offline && (
        <div className="flex items-center gap-2 border-b border-amber-500/20 bg-amber-950/35 px-3.5 py-1.5 text-[11px] text-amber-200/90">
          <WifiOff className="h-3.5 w-3.5 shrink-0" />
          <span>Sem internet · exibindo publicações em cache local.</span>
        </div>
      )}

      {selectedDm ? (
        <div className="flex flex-1 flex-col justify-between overflow-y-auto px-3.5 py-3">
          <div className="space-y-2.5">
            {selectedDm.messages.map((m) => (
              <div
                key={m.id}
                className={`flex flex-col ${
                  m.from === 'leticia' ? 'items-end' : 'items-start'
                }`}
              >
                <div
                  className={`max-w-[84%] rounded-2xl px-3 py-2 text-xs leading-relaxed ${
                    m.from === 'leticia'
                      ? 'bg-zinc-200 text-zinc-950'
                      : 'bg-[#1a1d24] text-zinc-200'
                  }`}
                >
                  {m.text}
                </div>
                <span className="mt-0.5 font-mono text-[9.5px] text-zinc-500">
                  {m.time}
                </span>
              </div>
            ))}
          </div>

          {selectedDm.id === 'sdm-camila' && (
            <button
              type="button"
              onClick={() => {
                chapterAudio.playUiTap();
                onNavigate({ appId: 'pulso', targetId: 'pulso-camila' });
              }}
              className="mt-4 rounded-xl border border-white/10 bg-[#15171c] px-3 py-2 text-center text-xs text-zinc-200 hover:border-white/25"
            >
              Abrir conversa com Camila no PulsoChat →
            </button>
          )}
        </div>
      ) : tab === 'feed' ? (
        <div className="flex-1 space-y-4 overflow-y-auto px-3.5 py-3">
          {ECOSYSTEM_SOCIAL_POSTS.map((post) => {
            const liked = Boolean(likedIds[post.id]);
            return (
              <article
                key={post.id}
                className="overflow-hidden rounded-2xl border border-white/10 bg-[#15171c]"
              >
                <div className="flex items-center justify-between px-3 py-2.5">
                  <div>
                    <p className="text-xs font-semibold text-zinc-100">
                      {post.authorName}
                    </p>
                    <p className="text-[10.5px] text-zinc-400">
                      {post.authorHandle}
                      {post.location ? ` · ${post.location}` : ''}
                    </p>
                  </div>
                  <span className="font-mono text-[10px] text-zinc-500">
                    {post.dateLabel}
                  </span>
                </div>

                {post.imageSrc && (
                  <img
                    src={resolveSocialImageSrc(post.imageSrc)}
                    alt={post.imageAlt ?? post.caption}
                    className="h-44 w-full object-cover"
                  />
                )}

                <div className="space-y-2 p-3">
                  <div className="flex items-center gap-3">
                    <button
                      type="button"
                      onClick={() => {
                        chapterAudio.playUiTap();
                        setLikedIds((prev) => ({ ...prev, [post.id]: !prev[post.id] }));
                      }}
                      aria-label={`Curtir publicação de ${post.authorName}`}
                      className={`flex items-center gap-1 text-xs ${
                        liked ? 'text-rose-400' : 'text-zinc-400 hover:text-zinc-200'
                      }`}
                    >
                      <Heart className={`h-4 w-4 ${liked ? 'fill-current' : ''}`} />
                      <span className="font-mono text-[11px]">
                        {post.likes + (liked ? 1 : 0)}
                      </span>
                    </button>
                    <span className="flex items-center gap-1 text-xs text-zinc-500">
                      <MessageCircle className="h-4 w-4" />
                      <span className="font-mono text-[11px]">
                        {post.comments.length}
                      </span>
                    </span>
                  </div>

                  <p className="text-xs leading-relaxed text-zinc-200">
                    <span className="font-semibold">{post.authorHandle}</span>{' '}
                    {post.caption}
                  </p>

                  {post.comments.length > 0 && (
                    <div className="space-y-1 border-t border-white/6 pt-2">
                      {post.comments.map((c) => (
                        <p key={c.id} className="text-[11px] text-zinc-400">
                          <span className="font-medium text-zinc-200">{c.handle}</span>{' '}
                          {c.text}
                        </p>
                      ))}
                    </div>
                  )}
                </div>
              </article>
            );
          })}
        </div>
      ) : tab === 'profile' ? (
        <div className="flex-1 space-y-4 overflow-y-auto px-4 py-4">
          <div className="flex items-center gap-3.5">
            <img
              src={evidenceLeticiaPortrait}
              alt="Foto de perfil de Letícia"
              className="h-16 w-16 rounded-full border border-white/15 object-cover object-top grayscale"
            />
            <div>
              <h3 className="text-sm font-semibold text-zinc-100">
                Letícia Vasconcelos
              </h3>
              <p className="text-xs text-zinc-400">@leticiavasc</p>
              <p className="mt-1 text-[11px] text-zinc-400">
                Arquitetura e restauro · São Paulo
              </p>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-2 rounded-2xl border border-white/8 bg-[#15171c] py-2.5 text-center">
            <div>
              <p className="font-mono text-sm font-semibold text-zinc-100">42</p>
              <p className="text-[10px] text-zinc-500">Publicações</p>
            </div>
            <div>
              <p className="font-mono text-sm font-semibold text-zinc-100">318</p>
              <p className="text-[10px] text-zinc-500">Seguidores</p>
            </div>
            <div>
              <p className="font-mono text-sm font-semibold text-zinc-100">274</p>
              <p className="text-[10px] text-zinc-500">Seguindo</p>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-1.5">
            {ECOSYSTEM_SOCIAL_POSTS.filter((p) => p.imageSrc).map((p) => (
              <div
                key={p.id}
                className="aspect-square overflow-hidden rounded-lg border border-white/8 bg-zinc-900"
              >
                <img
                  src={resolveSocialImageSrc(p.imageSrc)}
                  alt={p.imageAlt ?? p.caption}
                  className="h-full w-full object-cover"
                />
              </div>
            ))}
          </div>
        </div>
      ) : (
        <div className="flex-1 divide-y divide-white/5 overflow-y-auto px-3.5 py-2">
          {ECOSYSTEM_SOCIAL_DMS.map((dm) => (
            <button
              key={dm.id}
              type="button"
              onClick={() => {
                chapterAudio.playUiTap();
                setSelectedDm(dm);
              }}
              className="flex w-full items-center justify-between gap-3 py-3 text-left hover:bg-white/4"
            >
              <div className="min-w-0">
                <p className="text-xs font-semibold text-zinc-100">
                  {dm.displayName}{' '}
                  <span className="font-normal text-zinc-500">{dm.handle}</span>
                </p>
                <p className="mt-0.5 truncate text-[11px] text-zinc-400">
                  {dm.messages[dm.messages.length - 1]?.text}
                </p>
              </div>
              <div className="flex shrink-0 items-center gap-1.5 text-[10px] text-zinc-500">
                <Send className="h-3 w-3" />
                <span>{dm.lastTime}</span>
              </div>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

// ============================================================================
// FAÍSCA (App de Relacionamento — Matches, Bloqueados, Conversas preservadas)
// ============================================================================

export function DatingApp({
  onBackHome,
}: {
  onBackHome: () => void;
}) {
  const [tab, setTab] = useState<'active' | 'ended' | 'blocked'>('active');
  const [selectedMatch, setSelectedMatch] = useState<DatingMatchRecord | null>(null);

  const counts = {
    active: ECOSYSTEM_DATING_MATCHES.filter((m) => m.status === 'active').length,
    ended: ECOSYSTEM_DATING_MATCHES.filter((m) => m.status === 'ended').length,
    blocked: ECOSYSTEM_DATING_MATCHES.filter((m) => m.status === 'blocked').length,
  };

  const visibleMatches = ECOSYSTEM_DATING_MATCHES.filter((m) => m.status === tab);

  return (
    <div data-testid="app-dating" className="flex min-h-0 flex-1 flex-col bg-[#0c0d11]">
      <div className="flex items-center justify-between border-b border-white/10 px-3 py-2.5">
        <div className="flex items-center gap-1.5">
          <button
            type="button"
            onClick={() => {
              chapterAudio.playUiTap();
              if (selectedMatch) {
                setSelectedMatch(null);
              } else {
                onBackHome();
              }
            }}
            aria-label="Voltar"
            className="flex h-8 w-8 items-center justify-center rounded-full text-zinc-300 hover:bg-white/10"
          >
            <ChevronLeft className="h-5 w-5" />
          </button>
          <div className="flex items-center gap-1.5">
            <Flame className="h-4 w-4 text-rose-400" />
            <h2 className="text-sm font-semibold text-zinc-100">
              {selectedMatch ? `${selectedMatch.name}, ${selectedMatch.age}` : 'Faísca'}
            </h2>
          </div>
        </div>
        {!selectedMatch && (
          <span className="font-mono text-[10px] text-zinc-500">
            {ECOSYSTEM_DATING_MATCHES.length} perfis
          </span>
        )}
      </div>

      {!selectedMatch && (
        <div className="grid grid-cols-3 gap-1 border-b border-white/8 bg-[#101218] px-3 py-2 text-[11px]">
          {(
            [
              ['active', `Matches (${counts.active})`],
              ['ended', `Encerrados (${counts.ended})`],
              ['blocked', `Bloqueados (${counts.blocked})`],
            ] as const
          ).map(([key, label]) => (
            <button
              key={key}
              type="button"
              data-testid={`dating-tab-${key}`}
              onClick={() => {
                chapterAudio.playUiTap();
                setTab(key);
              }}
              className={`rounded-lg py-1.5 font-medium transition-colors ${
                tab === key
                  ? key === 'blocked'
                    ? 'bg-[#752B32] text-rose-100'
                    : 'bg-zinc-200 text-zinc-950'
                  : 'text-zinc-400 hover:bg-white/6 hover:text-zinc-200'
              }`}
            >
              {label}
            </button>
          ))}
        </div>
      )}

      {selectedMatch ? (
        <div className="flex flex-1 flex-col overflow-y-auto px-3.5 py-3">
          <div className="mb-3 rounded-2xl border border-white/10 bg-[#15171c] p-3">
            <div className="flex items-center justify-between text-[11px]">
              <span className="text-zinc-400">{selectedMatch.distanceLabel}</span>
              {selectedMatch.status === 'blocked' && (
                <span className="flex items-center gap-1 rounded-md bg-[#752B32]/40 px-2 py-0.5 text-[10px] text-rose-200">
                  <Ban className="h-3 w-3" />
                  Bloqueado em {selectedMatch.lastActive}
                </span>
              )}
              {selectedMatch.status === 'ended' && (
                <span className="rounded-md bg-white/8 px-2 py-0.5 text-[10px] text-zinc-400">
                  Conversa encerrada
                </span>
              )}
            </div>
            <p className="mt-1.5 text-xs text-zinc-300">{selectedMatch.bio}</p>
          </div>

          <div className="space-y-2.5">
            {selectedMatch.messages.map((m) => (
              <div
                key={m.id}
                className={`flex flex-col ${
                  m.from === 'leticia' ? 'items-end' : 'items-start'
                }`}
              >
                <div
                  className={`max-w-[86%] rounded-2xl px-3 py-2 text-xs leading-relaxed ${
                    m.from === 'leticia'
                      ? 'bg-zinc-200 text-zinc-950'
                      : 'bg-[#1a1d24] text-zinc-200'
                  }`}
                >
                  {m.text}
                </div>
                <span className="mt-0.5 font-mono text-[9.5px] text-zinc-500">
                  {m.time}
                </span>
              </div>
            ))}
          </div>
        </div>
      ) : (
        <div className="flex-1 space-y-2.5 overflow-y-auto px-3.5 py-3">
          {visibleMatches.map((match) => (
            <button
              key={match.id}
              type="button"
              data-testid={`dating-match-${match.id}`}
              onClick={() => {
                chapterAudio.playUiTap();
                setSelectedMatch(match);
              }}
              className="flex w-full items-start gap-3 rounded-2xl border border-white/10 bg-[#15171c] p-3.5 text-left hover:border-white/20"
            >
              <span
                className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-xs font-semibold ${
                  match.status === 'blocked'
                    ? 'bg-[#752B32]/45 text-rose-200'
                    : match.status === 'ended'
                      ? 'bg-zinc-800/80 text-zinc-400'
                      : 'bg-zinc-800 text-zinc-200'
                }`}
              >
                {match.status === 'blocked' ? (
                  <Ban className="h-4 w-4" />
                ) : (
                  <Sparkles className="h-4 w-4 text-rose-300" />
                )}
              </span>
              <div className="min-w-0 flex-1">
                <div className="flex items-center justify-between">
                  <p className="text-xs font-semibold text-zinc-100">
                    {match.name}, {match.age}
                  </p>
                  <span className="font-mono text-[10px] text-zinc-500">
                    {match.lastActive}
                  </span>
                </div>
                <p className="mt-0.5 text-[10.5px] text-zinc-500">
                  {match.distanceLabel}
                </p>
                <p className="mt-1 line-clamp-2 text-[11px] text-zinc-400">
                  {match.messages[match.messages.length - 1]?.text}
                </p>
              </div>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
