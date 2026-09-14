import React, { useState, useMemo, useEffect, useRef } from "react";
import {
  ShoppingBag, X, Plus, Minus, MapPin, Home, CreditCard, Banknote,
  QrCode, Check, ChevronLeft, Flame, Trash2, MessageCircle, Clock, Star
} from "lucide-react";

/* =========================================================================
   ⚠️  PASSO 1 — COLOQUE O WHATSAPP REAL DA EMPRESA AQUI  ⚠️
   Formato: código do país (55) + DDD + número, tudo junto, sem espaço,
   sem traço, sem parênteses. Exemplo pra (11) 98765-4321 → "5511987654321"
   ========================================================================= */
const WHATSAPP_NUMBER = "5511987654321"; // <-- TROCAR AQUI

/* =========================================================================
   PASSO 2 — DADOS DO NEGÓCIO. Troque nome, taxas e horário. Isso é tudo
   que muda pra reaproveitar essa mesma base em outro tipo de negócio.
   ========================================================================= */
const BUSINESS = {
  name: "Brasa & Fumaça",
  tagline: "Prensado na chapa. Selado na brasa.",
  whatsapp: WHATSAPP_NUMBER,
  deliveryFee: 6,
  minOrder: 20,
  hours: "Ter–Dom · 18h30 às 23h30",
  rating: 4.9,
};

const CATEGORIES = [
  { id: "combos", label: "Combos", icon: Flame },
  { id: "burgers", label: "Burgers", icon: null },
  { id: "acompanhamentos", label: "Acompanhamentos", icon: null },
  { id: "bebidas", label: "Bebidas", icon: null },
];

const EXTRAS = [
  { id: "bacon", name: "Bacon crocante", price: 6 },
  { id: "cheddar", name: "Cheddar extra", price: 5 },
  { id: "ovo", name: "Ovo caipira", price: 4 },
  { id: "cebola-caramelizada", name: "Cebola caramelizada", price: 4 },
  { id: "picles", name: "Picles artesanal", price: 3 },
];

/* =========================================================================
   PASSO 3 — FOTOS DOS PRODUTOS
   Coloque os arquivos de foto dentro de: public/images/produtos/
   com EXATAMENTE o nome indicado no campo "img" de cada produto abaixo
   (ex: combo-brasa.jpg). Formato recomendado: .jpg, quadrado ou 4:3,
   pelo menos 800x800px. Enquanto o arquivo não existir, aparece um
   placeholder estilizado no lugar — nada quebra visualmente.
   ========================================================================= */
const PRODUCTS = [
  {
    id: "combo-brasa",
    category: "combos",
    name: "Combo Brasa",
    desc: "Burger smash duplo + fritas rústicas + refrigerante 350ml",
    price: 42,
    img: "/images/produtos/combo-brasa.jpg",
    tag: "Mais pedido",
    extrasAllowed: true,
  },
  {
    id: "combo-fumaca",
    category: "combos",
    name: "Combo Fumaça",
    desc: "Burger de costela desfiada + onion rings + suco natural",
    price: 46,
    img: "/images/produtos/combo-fumaca.jpg",
    extrasAllowed: true,
  },
  {
    id: "combo-carvao",
    category: "combos",
    name: "Combo Carvão",
    desc: "Duplo cheddar + bacon + fritas + refrigerante lata",
    price: 39,
    img: "/images/produtos/combo-carvao.jpg",
    extrasAllowed: true,
  },
  {
    id: "smash-classico",
    category: "burgers",
    name: "Smash Clássico",
    desc: "180g na chapa, queijo prato, picles, molho da casa",
    price: 26,
    img: "/images/produtos/smash-classico.jpg",
    extrasAllowed: true,
  },
  {
    id: "costela-desfiada",
    category: "burgers",
    name: "Costela na Brasa",
    desc: "Costela desfiada 12h, cheddar cremoso, cebola crispy",
    price: 32,
    img: "/images/produtos/costela-desfiada.jpg",
    tag: "Assinatura",
    extrasAllowed: true,
  },
  {
    id: "duplo-cheddar",
    category: "burgers",
    name: "Duplo Cheddar",
    desc: "Dois blends smash, cheddar em dobro, bacon fumado",
    price: 29,
    img: "/images/produtos/duplo-cheddar.jpg",
    extrasAllowed: true,
  },
  {
    id: "fritas-rusticas",
    category: "acompanhamentos",
    name: "Fritas Rústicas",
    desc: "Casca e tudo, alecrim e flor de sal",
    price: 14,
    img: "/images/produtos/fritas-rusticas.jpg",
    extrasAllowed: false,
  },
  {
    id: "onion-rings",
    category: "acompanhamentos",
    name: "Onion Rings",
    desc: "Empanados na hora, molho barbecue defumado",
    price: 16,
    img: "/images/produtos/onion-rings.jpg",
    extrasAllowed: false,
  },
  {
    id: "refrigerante-lata",
    category: "bebidas",
    name: "Refrigerante Lata",
    desc: "350ml — coca, guaraná ou zero",
    price: 6,
    img: "/images/produtos/refrigerante-lata.jpg",
    extrasAllowed: false,
  },
  {
    id: "suco-natural",
    category: "bebidas",
    name: "Suco Natural",
    desc: "500ml — laranja, limão ou maracujá",
    price: 9,
    img: "/images/produtos/suco-natural.jpg",
    extrasAllowed: false,
  },
];

const money = (n) =>
  n.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });

/* ---------------------------- App ---------------------------- */

export default function App() {
  const [view, setView] = useState("catalog"); // catalog | checkout | review | confirmation
  const [activeCategory, setActiveCategory] = useState("combos");
  const [cart, setCart] = useState([]);
  const [cartOpen, setCartOpen] = useState(false);
  const [productModal, setProductModal] = useState(null);
  const [orderNumber] = useState(() => String(Math.floor(1000 + Math.random() * 9000)));
  const [form, setForm] = useState({
    name: "",
    phone: "",
    method: "entrega",
    address: "",
    payment: "pix",
    troco: "",
    notes: "",
  });
  const sectionRefs = useRef({});

  useEffect(() => {
    document.body.style.overflow = cartOpen || productModal ? "hidden" : "auto";
  }, [cartOpen, productModal]);

  const subtotal = useMemo(
    () => cart.reduce((s, i) => s + i.unitPrice * i.qty, 0),
    [cart]
  );
  const deliveryFee = form.method === "entrega" && cart.length ? BUSINESS.deliveryFee : 0;
  const total = subtotal + deliveryFee;
  const cartCount = cart.reduce((s, i) => s + i.qty, 0);

  function addToCart(product, extras, qty) {
    const extraTotal = extras.reduce((s, e) => s + e.price, 0);
    const key = product.id + "|" + extras.map((e) => e.id).sort().join(",");
    setCart((prev) => {
      const existing = prev.find((i) => i.key === key);
      if (existing) {
        return prev.map((i) => (i.key === key ? { ...i, qty: i.qty + qty } : i));
      }
      return [
        ...prev,
        {
          key,
          id: product.id,
          name: product.name,
          img: product.img,
          extras,
          unitPrice: product.price + extraTotal,
          qty,
        },
      ];
    });
    setProductModal(null);
    setCartOpen(true);
  }

  function changeQty(key, delta) {
    setCart((prev) =>
      prev
        .map((i) => (i.key === key ? { ...i, qty: i.qty + delta } : i))
        .filter((i) => i.qty > 0)
    );
  }

  function removeItem(key) {
    setCart((prev) => prev.filter((i) => i.key !== key));
  }

  function scrollToCategory(id) {
    setActiveCategory(id);
    sectionRefs.current[id]?.scrollIntoView({ behavior: "smooth", block: "start" });
  }

  function buildWhatsAppMessage() {
    const lines = [];
    lines.push(`*Pedido #${orderNumber} — ${BUSINESS.name}*`);
    lines.push("──────────────────────");
    cart.forEach((i) => {
      lines.push(`${i.qty}x ${i.name}  —  ${money(i.unitPrice * i.qty)}`);
      if (i.extras.length) {
        lines.push(`   + ${i.extras.map((e) => e.name).join(", ")}`);
      }
    });
    lines.push("──────────────────────");
    lines.push(`Subtotal: ${money(subtotal)}`);
    if (deliveryFee) lines.push(`Entrega: ${money(deliveryFee)}`);
    lines.push(`*Total: ${money(total)}*`);
    lines.push("");
    lines.push(`Cliente: ${form.name}`);
    lines.push(`Telefone: ${form.phone}`);
    lines.push(
      form.method === "entrega" ? `Entrega em: ${form.address}` : "Retirada no local"
    );
    lines.push(
      `Pagamento: ${
        form.payment === "pix" ? "Pix" : form.payment === "dinheiro" ? `Dinheiro (troco para ${form.troco || "—"})` : "Cartão na entrega"
      }`
    );
    if (form.notes) lines.push(`Obs: ${form.notes}`);
    return lines.join("\n");
  }

  function sendWhatsApp() {
    const text = encodeURIComponent(buildWhatsAppMessage());
    window.open(`https://wa.me/${BUSINESS.whatsapp}?text=${text}`, "_blank");
    setView("confirmation");
  }

  return (
    <div className="brasa-root">
      <FontsAndStyles />

      {view === "catalog" && (
        <CatalogView
          activeCategory={activeCategory}
          scrollToCategory={scrollToCategory}
          sectionRefs={sectionRefs}
          setProductModal={setProductModal}
          addToCart={addToCart}
          cart={cart}
          cartCount={cartCount}
          total={total}
          setCartOpen={setCartOpen}
        />
      )}

      {cartOpen && (
        <CartDrawer
          cart={cart}
          changeQty={changeQty}
          removeItem={removeItem}
          subtotal={subtotal}
          onClose={() => setCartOpen(false)}
          onCheckout={() => {
            setCartOpen(false);
            setView("checkout");
          }}
          minOrder={BUSINESS.minOrder}
        />
      )}

      {productModal && (
        <ProductModal
          product={productModal}
          onClose={() => setProductModal(null)}
          onAdd={addToCart}
        />
      )}

      {view === "checkout" && (
        <CheckoutView
          form={form}
          setForm={setForm}
          subtotal={subtotal}
          deliveryFee={deliveryFee}
          total={total}
          onBack={() => setView("catalog")}
          onReview={() => setView("review")}
        />
      )}

      {view === "review" && (
        <ReviewView
          cart={cart}
          form={form}
          subtotal={subtotal}
          deliveryFee={deliveryFee}
          total={total}
          orderNumber={orderNumber}
          onBack={() => setView("checkout")}
          onSend={sendWhatsApp}
        />
      )}

      {view === "confirmation" && (
        <ConfirmationView
          orderNumber={orderNumber}
          onNewOrder={() => {
            setCart([]);
            setForm({
              name: "",
              phone: "",
              method: "entrega",
              address: "",
              payment: "pix",
              troco: "",
              notes: "",
            });
            setView("catalog");
          }}
        />
      )}
    </div>
  );
}

/* ---------------------------- Catalog ---------------------------- */

function CatalogView({
  activeCategory,
  scrollToCategory,
  sectionRefs,
  setProductModal,
  addToCart,
  cart,
  cartCount,
  total,
  setCartOpen,
}) {
  return (
    <div className="pb-28">
      {/* HERO */}
      <div className="hero">
        <div className="hero-ember" />
        <div className="hero-content">
          <div className="hero-badges">
            <span className="badge"><Star size={12} strokeWidth={2.5} /> {BUSINESS.rating}</span>
            <span className="badge"><Clock size={12} strokeWidth={2.5} /> {BUSINESS.hours}</span>
          </div>
          <h1 className="hero-title">
            BRASA<span className="amp">&</span>FUMAÇA
          </h1>
          <p className="hero-tagline">{BUSINESS.tagline}</p>
          <button
            className="btn-primary hero-cta"
            onClick={() => scrollToCategory("combos")}
          >
            Ver cardápio
          </button>
        </div>
      </div>

      {/* CATEGORY NAV */}
      <div className="cat-nav">
        {CATEGORIES.map((c) => (
          <button
            key={c.id}
            onClick={() => scrollToCategory(c.id)}
            className={"cat-chip" + (activeCategory === c.id ? " cat-chip-active" : "")}
          >
            {c.id === "combos" && <Flame size={14} strokeWidth={2.5} />}
            {c.label}
          </button>
        ))}
      </div>

      {/* SECTIONS */}
      {CATEGORIES.map((cat) => (
        <div
          key={cat.id}
          ref={(el) => (sectionRefs.current[cat.id] = el)}
          className="menu-section"
        >
          <div className="section-head">
            <span className="section-eyebrow">{"//"} {String(CATEGORIES.indexOf(cat) + 1).padStart(2, "0")}</span>
            <h2 className="section-title">{cat.label}</h2>
          </div>
          <div className="product-grid">
            {PRODUCTS.filter((p) => p.category === cat.id).map((p) => (
              <ProductCard
                key={p.id}
                product={p}
                onOpen={() => setProductModal(p)}
                onQuickAdd={() => addToCart(p, [], 1)}
              />
            ))}
          </div>
        </div>
      ))}

      <footer className="catalog-footer">
        <p>{BUSINESS.name} · pedido mínimo {money(BUSINESS.minOrder)}</p>
      </footer>

      {cartCount > 0 && (
        <button className="cart-bar" onClick={() => setCartOpen(true)}>
          <span className="cart-bar-count">
            <ShoppingBag size={18} strokeWidth={2.5} />
            <span className="cart-bar-dot">{cartCount}</span>
          </span>
          <span className="cart-bar-label">Ver carrinho</span>
          <span className="cart-bar-total">{money(total)}</span>
        </button>
      )}
    </div>
  );
}

function ProductCard({ product, onOpen, onQuickAdd }) {
  return (
    <div className="product-card">
      <div className="product-img-wrap" onClick={onOpen}>
        <img
          src={product.img}
          alt={product.name}
          className="product-img"
          onError={(e) => {
            e.target.style.display = "none";
            e.target.nextSibling.style.display = "flex";
          }}
        />
        <div className="product-img-fallback">
          <Flame size={22} strokeWidth={1.5} />
        </div>
        {product.tag && <span className="product-tag">{product.tag}</span>}
      </div>
      <div className="product-info">
        <h3 className="product-name" onClick={onOpen}>{product.name}</h3>
        <p className="product-desc">{product.desc}</p>
        <div className="product-row">
          <span className="product-price">{money(product.price)}</span>
          <button
            className="btn-add"
            onClick={product.extrasAllowed ? onOpen : onQuickAdd}
            aria-label={`Adicionar ${product.name}`}
          >
            <Plus size={16} strokeWidth={3} />
          </button>
        </div>
      </div>
    </div>
  );
}

/* ---------------------------- Product Modal ---------------------------- */

function ProductModal({ product, onClose, onAdd }) {
  const [selected, setSelected] = useState([]);
  const [qty, setQty] = useState(1);

  function toggleExtra(extra) {
    setSelected((prev) =>
      prev.find((e) => e.id === extra.id)
        ? prev.filter((e) => e.id !== extra.id)
        : [...prev, extra]
    );
  }

  const unitPrice = product.price + selected.reduce((s, e) => s + e.price, 0);

  return (
    <div className="sheet-overlay" onClick={onClose}>
      <div className="sheet product-sheet" onClick={(e) => e.stopPropagation()}>
        <div className="sheet-grabber" />
        <button className="sheet-close" onClick={onClose}><X size={18} /></button>
        <div className="modal-img-wrap">
          <img
            src={product.img}
            alt={product.name}
            className="modal-img"
            onError={(e) => {
              e.target.style.display = "none";
              e.target.nextSibling.style.display = "flex";
            }}
          />
          <div className="modal-img-fallback">
            <Flame size={30} strokeWidth={1.5} />
          </div>
        </div>
        <div className="sheet-body">
          <h2 className="modal-title">{product.name}</h2>
          <p className="modal-desc">{product.desc}</p>

          {product.extrasAllowed && (
            <div className="extras-block">
              <span className="extras-label">Adicionais</span>
              {EXTRAS.map((extra) => {
                const active = !!selected.find((e) => e.id === extra.id);
                return (
                  <button
                    key={extra.id}
                    className={"extra-row" + (active ? " extra-row-active" : "")}
                    onClick={() => toggleExtra(extra)}
                  >
                    <span className="extra-check">{active && <Check size={12} strokeWidth={3} />}</span>
                    <span className="extra-name">{extra.name}</span>
                    <span className="extra-price">+ {money(extra.price)}</span>
                  </button>
                );
              })}
            </div>
          )}

          <div className="modal-footer">
            <div className="qty-stepper">
              <button onClick={() => setQty((q) => Math.max(1, q - 1))}><Minus size={14} /></button>
              <span>{qty}</span>
              <button onClick={() => setQty((q) => q + 1)}><Plus size={14} /></button>
            </div>
            <button
              className="btn-primary modal-add-btn"
              onClick={() => onAdd(product, selected, qty)}
            >
              Adicionar · {money(unitPrice * qty)}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ---------------------------- Cart Drawer ---------------------------- */

function CartDrawer({ cart, changeQty, removeItem, subtotal, onClose, onCheckout, minOrder }) {
  const belowMin = subtotal > 0 && subtotal < minOrder;
  return (
    <div className="sheet-overlay" onClick={onClose}>
      <div className="sheet cart-sheet" onClick={(e) => e.stopPropagation()}>
        <div className="sheet-grabber" />
        <div className="cart-header">
          <h2 className="ticket-title">Sua comanda</h2>
          <button className="sheet-close-inline" onClick={onClose}><X size={18} /></button>
        </div>

        {cart.length === 0 ? (
          <div className="cart-empty">
            <ShoppingBag size={28} strokeWidth={1.5} />
            <p>Sua comanda está vazia.</p>
          </div>
        ) : (
          <>
            <div className="ticket">
              {cart.map((item) => (
                <div className="ticket-item" key={item.key}>
                  <div className="ticket-item-main">
                    <span className="ticket-item-name">{item.name}</span>
                    {item.extras.length > 0 && (
                      <span className="ticket-item-extras">
                        + {item.extras.map((e) => e.name).join(", ")}
                      </span>
                    )}
                    <span className="ticket-item-price">{money(item.unitPrice * item.qty)}</span>
                  </div>
                  <div className="ticket-item-actions">
                    <div className="qty-stepper qty-stepper-sm">
                      <button onClick={() => changeQty(item.key, -1)}><Minus size={12} /></button>
                      <span>{item.qty}</span>
                      <button onClick={() => changeQty(item.key, 1)}><Plus size={12} /></button>
                    </div>
                    <button className="ticket-remove" onClick={() => removeItem(item.key)}>
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>
              ))}
              <div className="ticket-perforation" />
              <div className="ticket-total-row">
                <span>Subtotal</span>
                <span>{money(subtotal)}</span>
              </div>
            </div>

            {belowMin ? (
              <p className="min-order-notice">
                Faltam {money(minOrder - subtotal)} para o pedido mínimo de {money(minOrder)}.
              </p>
            ) : (
              <button className="btn-primary cart-checkout-btn" onClick={onCheckout}>
                Finalizar pedido
              </button>
            )}
          </>
        )}
      </div>
    </div>
  );
}

/* ---------------------------- Checkout ---------------------------- */

function CheckoutView({ form, setForm, subtotal, deliveryFee, total, onBack, onReview }) {
  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }));
  const canSubmit =
    form.name.trim() &&
    form.phone.trim() &&
    (form.method === "retirada" || form.address.trim());

  return (
    <div className="page">
      <PageHeader title="Finalizar pedido" onBack={onBack} />
      <div className="page-body">
        <FieldGroup label="Seus dados">
          <input className="field" placeholder="Nome completo" value={form.name} onChange={set("name")} />
          <input className="field" placeholder="Telefone / WhatsApp" value={form.phone} onChange={set("phone")} />
        </FieldGroup>

        <FieldGroup label="Como você quer receber">
          <div className="toggle-row">
            <button
              className={"toggle-btn" + (form.method === "entrega" ? " toggle-btn-active" : "")}
              onClick={() => setForm((f) => ({ ...f, method: "entrega" }))}
            >
              <MapPin size={16} /> Entrega
            </button>
            <button
              className={"toggle-btn" + (form.method === "retirada" ? " toggle-btn-active" : "")}
              onClick={() => setForm((f) => ({ ...f, method: "retirada" }))}
            >
              <Home size={16} /> Retirada
            </button>
          </div>
          {form.method === "entrega" && (
            <textarea
              className="field field-textarea"
              placeholder="Rua, número, bairro, referência..."
              value={form.address}
              onChange={set("address")}
            />
          )}
        </FieldGroup>

        <FieldGroup label="Pagamento">
          <div className="payment-row">
            <button
              className={"toggle-btn" + (form.payment === "pix" ? " toggle-btn-active" : "")}
              onClick={() => setForm((f) => ({ ...f, payment: "pix" }))}
            >
              <QrCode size={16} /> Pix
            </button>
            <button
              className={"toggle-btn" + (form.payment === "dinheiro" ? " toggle-btn-active" : "")}
              onClick={() => setForm((f) => ({ ...f, payment: "dinheiro" }))}
            >
              <Banknote size={16} /> Dinheiro
            </button>
            <button
              className={"toggle-btn" + (form.payment === "cartao" ? " toggle-btn-active" : "")}
              onClick={() => setForm((f) => ({ ...f, payment: "cartao" }))}
            >
              <CreditCard size={16} /> Cartão
            </button>
          </div>
          {form.payment === "dinheiro" && (
            <input
              className="field"
              placeholder="Troco para quanto?"
              value={form.troco}
              onChange={set("troco")}
            />
          )}
        </FieldGroup>

        <FieldGroup label="Observações (opcional)">
          <textarea
            className="field field-textarea"
            placeholder="Sem cebola, ponto da carne, etc."
            value={form.notes}
            onChange={set("notes")}
          />
        </FieldGroup>

        <div className="summary-mini">
          <div><span>Subtotal</span><span>{money(subtotal)}</span></div>
          {deliveryFee > 0 && <div><span>Entrega</span><span>{money(deliveryFee)}</span></div>}
          <div className="summary-mini-total"><span>Total</span><span>{money(total)}</span></div>
        </div>

        <button className="btn-primary" disabled={!canSubmit} onClick={onReview}>
          Revisar pedido
        </button>
      </div>
    </div>
  );
}

function FieldGroup({ label, children }) {
  return (
    <div className="field-group">
      <span className="field-group-label">{label}</span>
      {children}
    </div>
  );
}

function PageHeader({ title, onBack }) {
  return (
    <div className="page-header">
      <button className="back-btn" onClick={onBack}><ChevronLeft size={20} /></button>
      <h1>{title}</h1>
    </div>
  );
}

/* ---------------------------- Review (comanda final) ---------------------------- */

function ReviewView({ cart, form, subtotal, deliveryFee, total, orderNumber, onBack, onSend }) {
  return (
    <div className="page">
      <PageHeader title="Revisar pedido" onBack={onBack} />
      <div className="page-body">
        <div className="ticket ticket-final">
          <div className="ticket-final-head">
            <span className="ticket-final-brand">{BUSINESS.name}</span>
            <span className="ticket-final-order">Pedido #{orderNumber}</span>
          </div>
          <div className="ticket-perforation" />
          {cart.map((item) => (
            <div className="ticket-item" key={item.key}>
              <div className="ticket-item-main">
                <span className="ticket-item-name">{item.qty}x {item.name}</span>
                {item.extras.length > 0 && (
                  <span className="ticket-item-extras">+ {item.extras.map((e) => e.name).join(", ")}</span>
                )}
                <span className="ticket-item-price">{money(item.unitPrice * item.qty)}</span>
              </div>
            </div>
          ))}
          <div className="ticket-perforation" />
          <div className="ticket-total-row">
            <span>Subtotal</span><span>{money(subtotal)}</span>
          </div>
          {deliveryFee > 0 && (
            <div className="ticket-total-row"><span>Entrega</span><span>{money(deliveryFee)}</span></div>
          )}
          <div className="ticket-total-row ticket-total-final">
            <span>Total</span><span>{money(total)}</span>
          </div>
          <div className="ticket-perforation" />
          <div className="ticket-customer">
            <p><strong>{form.name}</strong> · {form.phone}</p>
            <p>{form.method === "entrega" ? form.address : "Retirada no local"}</p>
            <p>
              {form.payment === "pix" ? "Pix" : form.payment === "dinheiro" ? `Dinheiro (troco p/ ${form.troco || "—"})` : "Cartão na entrega"}
            </p>
            {form.notes && <p className="ticket-notes">"{form.notes}"</p>}
          </div>
        </div>

        <button className="btn-whatsapp" onClick={onSend}>
          <MessageCircle size={18} strokeWidth={2.5} />
          Enviar pedido pelo WhatsApp
        </button>
      </div>
    </div>
  );
}

/* ---------------------------- Confirmation ---------------------------- */

function ConfirmationView({ orderNumber, onNewOrder }) {
  return (
    <div className="confirmation">
      <div className="confirmation-icon"><Check size={30} strokeWidth={3} /></div>
      <h1>Pedido enviado!</h1>
      <p>O pedido #{orderNumber} foi enviado para o WhatsApp da {BUSINESS.name}. Assim que confirmarem, você recebe o retorno por lá.</p>
      <button className="btn-primary confirmation-btn" onClick={onNewOrder}>Fazer novo pedido</button>
    </div>
  );
}

/* ---------------------------- Styles & Fonts ---------------------------- */

function FontsAndStyles() {
  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Anton&family=Manrope:wght@400;500;600;700;800&family=JetBrains+Mono:wght@400;500;600&display=swap');

        .brasa-root {
          --bg: #0b0908;
          --surface: #17130f;
          --surface-2: #211a14;
          --ember: #d8332b;
          --ember-2: #f0553a;
          --ember-dark: #7a1d17;
          --gold: #e8a33d;
          --cream: #f3ece2;
          --muted: #a5988a;
          --line: rgba(243,236,226,0.09);
          font-family: 'Manrope', sans-serif;
          background: var(--bg);
          color: var(--cream);
          min-height: 100vh;
          position: relative;
          background-image:
            radial-gradient(ellipse 60% 40% at 15% 0%, rgba(216,51,43,0.16), transparent 60%),
            radial-gradient(ellipse 50% 35% at 100% 15%, rgba(232,163,61,0.08), transparent 55%);
        }

        .brasa-root * { box-sizing: border-box; }
        .brasa-root button { font-family: inherit; cursor: pointer; }
        .brasa-root input, .brasa-root textarea { font-family: inherit; }

        /* ---------- HERO ---------- */
        .hero { position: relative; padding: 30px 20px 26px; overflow: hidden; }
        .hero-ember {
          position: absolute; inset: 0;
          background: radial-gradient(ellipse 90% 60% at 50% -10%, rgba(216,51,43,0.35), transparent 65%);
          pointer-events: none;
        }
        .hero-content { position: relative; z-index: 1; }
        .hero-badges { display: flex; gap: 8px; margin-bottom: 16px; }
        .badge {
          display: inline-flex; align-items: center; gap: 5px;
          font-size: 11px; font-weight: 600; letter-spacing: 0.02em;
          color: var(--muted); background: var(--surface);
          border: 1px solid var(--line); border-radius: 100px;
          padding: 5px 10px;
        }
        .hero-title {
          font-family: 'Anton', sans-serif;
          font-size: 44px;
          line-height: 0.92;
          letter-spacing: 0.01em;
          margin: 0 0 10px;
          color: var(--cream);
          text-shadow: 0 0 40px rgba(216,51,43,0.35);
        }
        .hero-title .amp { color: var(--ember-2); margin: 0 2px; }
        .hero-tagline { color: var(--muted); font-size: 14.5px; margin: 0 0 20px; max-width: 30ch; }
        .hero-cta { width: auto; padding: 13px 26px; }

        /* ---------- CATEGORY NAV ---------- */
        .cat-nav {
          display: flex; gap: 8px; overflow-x: auto; padding: 4px 20px 18px;
          scrollbar-width: none; position: sticky; top: 0; z-index: 20;
          background: linear-gradient(to bottom, var(--bg) 70%, transparent);
        }
        .cat-nav::-webkit-scrollbar { display: none; }
        .cat-chip {
          flex-shrink: 0; display: inline-flex; align-items: center; gap: 6px;
          font-size: 13px; font-weight: 700; color: var(--muted);
          background: var(--surface); border: 1px solid var(--line);
          border-radius: 100px; padding: 9px 16px; transition: all .15s ease;
        }
        .cat-chip-active {
          color: #fff; background: var(--ember); border-color: var(--ember);
          box-shadow: 0 4px 16px rgba(216,51,43,0.35);
        }

        /* ---------- MENU SECTIONS ---------- */
        .menu-section { padding: 6px 20px 8px; }
        .section-head { display: flex; align-items: baseline; gap: 8px; margin: 22px 0 14px; }
        .section-eyebrow {
          font-family: 'JetBrains Mono', monospace; font-size: 11px;
          color: var(--gold); letter-spacing: 0.05em;
        }
        .section-title {
          font-family: 'Anton', sans-serif; font-size: 22px; font-weight: 400;
          letter-spacing: 0.01em; margin: 0; text-transform: uppercase;
        }

        .product-grid { display: grid; grid-template-columns: 1fr; gap: 14px; }
        .product-card {
          display: flex; gap: 12px; background: var(--surface);
          border: 1px solid var(--line); border-radius: 16px; padding: 10px;
        }
        .product-img-wrap {
          position: relative; width: 92px; height: 92px; flex-shrink: 0;
          border-radius: 12px; overflow: hidden; background: var(--surface-2);
        }
        .product-img { width: 100%; height: 100%; object-fit: cover; display: block; }
        .product-img-fallback {
          display: none; width: 100%; height: 100%; align-items: center; justify-content: center;
          color: var(--ember-2);
          background: radial-gradient(circle at 50% 40%, rgba(216,51,43,0.22), var(--surface-2) 70%);
        }
        .product-tag {
          position: absolute; bottom: 4px; left: 4px; right: 4px;
          font-size: 8.5px; font-weight: 800; text-transform: uppercase;
          letter-spacing: 0.04em; text-align: center; color: #fff;
          background: rgba(216,51,43,0.92); border-radius: 5px; padding: 2px 4px;
        }
        .product-info { flex: 1; min-width: 0; display: flex; flex-direction: column; }
        .product-name { font-size: 15px; font-weight: 700; margin: 2px 0 4px; color: var(--cream); }
        .product-desc {
          font-size: 12.5px; color: var(--muted); margin: 0; line-height: 1.4;
          display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden;
        }
        .product-row { display: flex; align-items: center; justify-content: space-between; margin-top: auto; padding-top: 8px; }
        .product-price {
          font-family: 'JetBrains Mono', monospace; font-size: 14px; font-weight: 600; color: var(--gold);
        }
        .btn-add {
          width: 30px; height: 30px; border-radius: 9px; border: none;
          background: var(--ember); color: #fff; display: flex; align-items: center; justify-content: center;
          transition: transform .12s ease;
        }
        .btn-add:active { transform: scale(0.9); }

        .catalog-footer { text-align: center; padding: 24px 20px 10px; }
        .catalog-footer p { font-size: 11.5px; color: var(--muted); font-family: 'JetBrains Mono', monospace; }

        /* ---------- CART BAR ---------- */
        .cart-bar {
          position: fixed; left: 16px; right: 16px; bottom: 16px; z-index: 30;
          display: flex; align-items: center; gap: 10px;
          background: var(--ember); color: #fff; border: none;
          border-radius: 16px; padding: 14px 16px;
          box-shadow: 0 10px 30px rgba(216,51,43,0.45);
        }
        .cart-bar-count { position: relative; display: flex; }
        .cart-bar-dot {
          position: absolute; top: -8px; right: -9px;
          background: #fff; color: var(--ember); font-size: 10px; font-weight: 800;
          border-radius: 100px; min-width: 16px; height: 16px; display: flex; align-items: center; justify-content: center;
        }
        .cart-bar-label { flex: 1; text-align: left; font-weight: 700; font-size: 14px; }
        .cart-bar-total { font-family: 'JetBrains Mono', monospace; font-weight: 700; font-size: 14px; }

        /* ---------- BUTTONS ---------- */
        .btn-primary {
          width: 100%; background: var(--ember); color: #fff; border: none;
          border-radius: 13px; padding: 15px; font-weight: 800; font-size: 14.5px;
          letter-spacing: 0.01em; text-transform: uppercase;
          box-shadow: 0 8px 20px rgba(216,51,43,0.3);
          transition: transform .12s ease, opacity .12s ease;
        }
        .btn-primary:active { transform: scale(0.98); }
        .btn-primary:disabled { opacity: 0.35; box-shadow: none; }
        .btn-whatsapp {
          width: 100%; display: flex; align-items: center; justify-content: center; gap: 8px;
          background: #1f9d55; color: #fff; border: none; border-radius: 13px;
          padding: 15px; font-weight: 800; font-size: 14.5px; margin-top: 16px;
          box-shadow: 0 8px 20px rgba(31,157,85,0.3);
        }

        /* ---------- SHEETS / MODALS ---------- */
        .sheet-overlay {
          position: fixed; inset: 0; background: rgba(0,0,0,0.6); backdrop-filter: blur(2px);
          z-index: 50; display: flex; align-items: flex-end;
        }
        .sheet {
          background: var(--bg); width: 100%; max-height: 88vh; overflow-y: auto;
          border-radius: 24px 24px 0 0; border-top: 1px solid var(--line);
          padding: 10px 20px 26px; position: relative;
        }
        .sheet-grabber { width: 36px; height: 4px; border-radius: 100px; background: var(--line); margin: 4px auto 10px; }
        .sheet-close {
          position: absolute; top: 14px; right: 16px; z-index: 2;
          width: 30px; height: 30px; border-radius: 100px; border: none;
          background: rgba(0,0,0,0.5); color: #fff; display: flex; align-items: center; justify-content: center;
        }
        .sheet-close-inline {
          width: 28px; height: 28px; border-radius: 100px; border: 1px solid var(--line);
          background: none; color: var(--muted); display: flex; align-items: center; justify-content: center;
        }
        .modal-img-wrap { width: calc(100% + 40px); margin: 0 -20px; height: 180px; position: relative; overflow: hidden; }
        .modal-img { width: 100%; height: 100%; object-fit: cover; display: block; }
        .modal-img-fallback {
          display: none; position: absolute; inset: 0; align-items: center; justify-content: center;
          color: var(--ember-2);
          background: radial-gradient(circle at 50% 40%, rgba(216,51,43,0.22), var(--surface-2) 70%);
        }
        .sheet-body { padding-top: 16px; }
        .modal-title { font-family: 'Anton', sans-serif; font-size: 22px; font-weight: 400; text-transform: uppercase; margin: 0 0 6px; }
        .modal-desc { color: var(--muted); font-size: 13.5px; margin: 0 0 18px; line-height: 1.5; }

        .extras-block { margin-bottom: 20px; }
        .extras-label { display: block; font-size: 11px; font-weight: 800; text-transform: uppercase; letter-spacing: 0.06em; color: var(--gold); margin-bottom: 10px; }
        .extra-row {
          width: 100%; display: flex; align-items: center; gap: 10px;
          background: var(--surface); border: 1px solid var(--line); border-radius: 11px;
          padding: 11px 12px; margin-bottom: 8px; text-align: left;
        }
        .extra-row-active { border-color: var(--ember); background: rgba(216,51,43,0.1); }
        .extra-check {
          width: 18px; height: 18px; border-radius: 6px; border: 1.5px solid var(--muted);
          display: flex; align-items: center; justify-content: center; flex-shrink: 0; color: var(--ember);
        }
        .extra-row-active .extra-check { border-color: var(--ember); background: var(--ember); color: #fff; }
        .extra-name { flex: 1; font-size: 13.5px; font-weight: 600; }
        .extra-price { font-family: 'JetBrains Mono', monospace; font-size: 12.5px; color: var(--muted); }

        .modal-footer { display: flex; gap: 10px; align-items: center; }
        .qty-stepper {
          display: flex; align-items: center; gap: 12px; background: var(--surface);
          border: 1px solid var(--line); border-radius: 12px; padding: 8px 12px; flex-shrink: 0;
        }
        .qty-stepper button { background: none; border: none; color: var(--cream); display: flex; }
        .qty-stepper span { font-family: 'JetBrains Mono', monospace; font-weight: 700; min-width: 14px; text-align: center; }
        .qty-stepper-sm { padding: 5px 8px; gap: 8px; }
        .modal-add-btn { flex: 1; }

        /* ---------- CART / TICKET (comanda) ---------- */
        .cart-header { display: flex; align-items: center; justify-content: space-between; margin-bottom: 14px; }
        .ticket-title { font-family: 'Anton', sans-serif; font-size: 20px; font-weight: 400; text-transform: uppercase; margin: 0; }
        .cart-empty { display: flex; flex-direction: column; align-items: center; gap: 10px; padding: 50px 0; color: var(--muted); }

        .ticket {
          background: var(--surface); border: 1px dashed var(--line); border-radius: 14px;
          padding: 16px; font-family: 'JetBrains Mono', monospace;
        }
        .ticket-item { padding: 8px 0; border-bottom: 1px solid var(--line); }
        .ticket-item:last-of-type { border-bottom: none; }
        .ticket-item-main { display: flex; flex-direction: column; gap: 2px; }
        .ticket-item-name { font-size: 13px; font-weight: 600; color: var(--cream); }
        .ticket-item-extras { font-size: 11px; color: var(--muted); }
        .ticket-item-price { font-size: 12px; color: var(--gold); margin-top: 2px; }
        .ticket-item-actions { display: flex; align-items: center; justify-content: space-between; margin-top: 8px; }
        .ticket-remove { background: none; border: none; color: var(--muted); }
        .ticket-perforation {
          height: 1px; margin: 12px -16px;
          background: repeating-linear-gradient(90deg, var(--line) 0 6px, transparent 6px 12px);
        }
        .ticket-total-row { display: flex; justify-content: space-between; font-size: 13px; color: var(--muted); padding: 3px 0; }
        .ticket-total-final { color: var(--cream); font-weight: 700; font-size: 15px; padding-top: 6px; }

        .min-order-notice { text-align: center; color: var(--gold); font-size: 12.5px; margin-top: 14px; }
        .cart-checkout-btn { margin-top: 16px; }

        /* ---------- CHECKOUT PAGE ---------- */
        .page { min-height: 100vh; background: var(--bg); }
        .page-header {
          display: flex; align-items: center; gap: 12px; padding: 18px 20px;
          position: sticky; top: 0; background: var(--bg); z-index: 10; border-bottom: 1px solid var(--line);
        }
        .page-header h1 { font-family: 'Anton', sans-serif; font-size: 18px; font-weight: 400; text-transform: uppercase; margin: 0; }
        .back-btn {
          width: 32px; height: 32px; border-radius: 100px; border: 1px solid var(--line);
          background: var(--surface); color: var(--cream); display: flex; align-items: center; justify-content: center;
        }
        .page-body { padding: 20px; padding-bottom: 50px; }

        .field-group { margin-bottom: 22px; }
        .field-group-label { display: block; font-size: 11px; font-weight: 800; text-transform: uppercase; letter-spacing: 0.06em; color: var(--gold); margin-bottom: 10px; }
        .field {
          width: 100%; background: var(--surface); border: 1px solid var(--line); color: var(--cream);
          border-radius: 12px; padding: 13px 14px; font-size: 14px; margin-bottom: 8px; outline: none;
        }
        .field:focus { border-color: var(--ember); }
        .field-textarea { resize: none; min-height: 70px; }
        .field::placeholder { color: var(--muted); }

        .toggle-row, .payment-row { display: flex; gap: 8px; margin-bottom: 10px; }
        .toggle-btn {
          flex: 1; display: flex; align-items: center; justify-content: center; gap: 6px;
          background: var(--surface); border: 1px solid var(--line); color: var(--muted);
          border-radius: 11px; padding: 12px 6px; font-size: 12.5px; font-weight: 700;
        }
        .toggle-btn-active { border-color: var(--ember); background: rgba(216,51,43,0.12); color: var(--cream); }

        .summary-mini {
          background: var(--surface); border: 1px solid var(--line); border-radius: 14px;
          padding: 14px 16px; margin: 6px 0 20px; font-family: 'JetBrains Mono', monospace; font-size: 13px;
        }
        .summary-mini > div { display: flex; justify-content: space-between; color: var(--muted); padding: 3px 0; }
        .summary-mini-total { color: var(--cream) !important; font-weight: 700; font-size: 15px; padding-top: 8px !important; margin-top: 6px; border-top: 1px solid var(--line); }

        /* ---------- REVIEW / TICKET FINAL ---------- */
        .ticket-final { padding: 20px; }
        .ticket-final-head { display: flex; justify-content: space-between; align-items: baseline; margin-bottom: 4px; }
        .ticket-final-brand { font-family: 'Anton', sans-serif; font-size: 16px; text-transform: uppercase; }
        .ticket-final-order { font-size: 11px; color: var(--gold); }
        .ticket-customer p { font-size: 12px; color: var(--muted); margin: 3px 0; }
        .ticket-customer strong { color: var(--cream); }
        .ticket-notes { font-style: italic; }

        /* ---------- CONFIRMATION ---------- */
        .confirmation {
          min-height: 100vh; display: flex; flex-direction: column; align-items: center; justify-content: center;
          text-align: center; padding: 40px; background: var(--bg);
        }
        .confirmation-icon {
          width: 62px; height: 62px; border-radius: 100px; background: #1f9d55; color: #fff;
          display: flex; align-items: center; justify-content: center; margin-bottom: 20px;
          box-shadow: 0 10px 30px rgba(31,157,85,0.4);
        }
        .confirmation h1 { font-family: 'Anton', sans-serif; font-size: 24px; text-transform: uppercase; margin: 0 0 10px; }
        .confirmation p { color: var(--muted); font-size: 13.5px; line-height: 1.6; max-width: 32ch; margin: 0 0 26px; }
        .confirmation-btn { max-width: 260px; }
      `}</style>
    </>
  );
}
