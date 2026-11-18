import { r as reactExports, T as jsxRuntimeExports } from "./worker-entry-BZn9M2UZ.js";
import { s as supabase, g as getCatalogItems } from "./catalog-D5wcCo6x.js";
import { g as getTestimonials, a as addTestimonial, d as deleteTestimonial } from "./testimonials-CuH6O2XJ.js";
import "node:events";
import "node:async_hooks";
import "node:stream/web";
import "node:stream";
function AdminTestimonialsPage() {
  const [authLoading, setAuthLoading] = reactExports.useState(true);
  const [isAuthorized, setIsAuthorized] = reactExports.useState(false);
  const [user, setUser] = reactExports.useState(null);
  const [message, setMessage] = reactExports.useState(null);
  const [catalogItems, setCatalogItems] = reactExports.useState([]);
  const adminEmails = "".split(",").map((s) => s.trim()).filter(Boolean);
  async function checkAuth() {
    setAuthLoading(true);
    try {
      const {
        data: {
          session
        }
      } = await supabase.auth.getSession();
      const currentUser = session?.user ?? null;
      setUser(currentUser);
      if (!currentUser) {
        setIsAuthorized(false);
        setAuthLoading(false);
        return;
      }
      const email = (currentUser.email || "").toLowerCase();
      const isAdmin = adminEmails.length === 0 || adminEmails.includes(email);
      setIsAuthorized(isAdmin);
      setAuthLoading(false);
    } catch (e) {
      setMessage("Unable to verify authentication.");
      setIsAuthorized(false);
      setAuthLoading(false);
    }
  }
  reactExports.useEffect(() => {
    checkAuth();
    const {
      data: sub
    } = supabase.auth.onAuthStateChange(() => checkAuth());
    return () => sub?.subscription?.unsubscribe?.();
  }, []);
  const [items, setItems] = reactExports.useState(() => getTestimonials());
  const [form, setForm] = reactExports.useState({
    name: "",
    location: "",
    quote: "",
    imagePreview: "",
    rating: 5,
    reviewType: "website",
    productName: ""
  });
  const [isSaving, setIsSaving] = reactExports.useState(false);
  reactExports.useEffect(() => {
    if (isAuthorized) {
      setItems(getTestimonials());
      getCatalogItems().then(setCatalogItems).catch(() => {
      });
    } else {
      setItems([]);
    }
  }, [isAuthorized]);
  function handleFile(e) {
    const file = e.target.files?.[0];
    if (!file) return setForm((s) => ({
      ...s,
      imagePreview: ""
    }));
    const reader = new FileReader();
    reader.onload = () => setForm((s) => ({
      ...s,
      imagePreview: String(reader.result)
    }));
    reader.readAsDataURL(file);
  }
  async function handleAdd(e) {
    e.preventDefault();
    if (!form.name.trim() || !form.quote.trim()) return setMessage("Name and quote are required.");
    if (form.reviewType === "product" && !form.productName) {
      return setMessage("Please select a product/tour to review.");
    }
    setIsSaving(true);
    try {
      addTestimonial({
        name: form.name.trim(),
        location: form.location.trim() || void 0,
        quote: form.quote.trim(),
        image: form.imagePreview || void 0,
        rating: form.rating,
        reviewType: form.reviewType,
        productName: form.reviewType === "product" ? form.productName : void 0
      });
      setItems(getTestimonials());
      setForm({
        name: "",
        location: "",
        quote: "",
        imagePreview: "",
        rating: 5,
        reviewType: "website",
        productName: ""
      });
      setMessage("Testimonial added.");
    } catch (err) {
      setMessage("Unable to add testimonial.");
    } finally {
      setIsSaving(false);
    }
  }
  function handleDelete(id) {
    deleteTestimonial(id);
    setItems(getTestimonials());
  }
  if (authLoading) return /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "min-h-screen flex items-center justify-center", children: "Verifying admin session…" });
  if (!user) return /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "min-h-screen flex items-center justify-center", children: "Please sign in to access admin." });
  if (!isAuthorized) return /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "min-h-screen flex items-center justify-center", children: "You are not authorized to access this page." });
  return /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "min-h-screen p-8 bg-[var(--brand-sand)]", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "max-w-4xl mx-auto bg-white rounded-[2rem] p-8 md:p-10 shadow-sm border border-[var(--brand-green)]/10", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx("h1", { className: "text-3xl font-[family-name:var(--font-display)] font-bold text-[var(--brand-green-deep)] mb-2", children: "Testimonials — Admin" }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "mb-6 text-sm text-muted-foreground", children: "Add, view or remove testimonials shown on the homepage. Submissions are persisted in local storage." }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("form", { onSubmit: handleAdd, className: "mb-8 space-y-4 bg-[var(--brand-sand)]/40 p-6 rounded-2xl border border-[var(--brand-green)]/5", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("h2", { className: "text-lg font-bold text-[var(--brand-green-deep)] mb-2", children: "Create Testimonial" }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid sm:grid-cols-2 gap-4", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("input", { required: true, value: form.name, onChange: (e) => setForm((s) => ({
          ...s,
          name: e.target.value
        })), placeholder: "Name", className: "w-full rounded-xl border bg-white px-4 py-3 text-sm outline-none" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("input", { value: form.location, onChange: (e) => setForm((s) => ({
          ...s,
          location: e.target.value
        })), placeholder: "Location (optional)", className: "w-full rounded-xl border bg-white px-4 py-3 text-sm outline-none" })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid sm:grid-cols-3 gap-4", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("label", { className: "block space-y-1", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-xs font-semibold text-[var(--brand-green-deep)]", children: "Rating" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("select", { value: form.rating, onChange: (e) => setForm((s) => ({
            ...s,
            rating: Number(e.target.value)
          })), className: "w-full rounded-xl border bg-white px-4 py-3 text-sm outline-none", children: [5, 4, 3, 2, 1].map((r) => /* @__PURE__ */ jsxRuntimeExports.jsxs("option", { value: r, children: [
            r,
            " Star",
            r !== 1 ? "s" : ""
          ] }, r)) })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("label", { className: "block space-y-1", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-xs font-semibold text-[var(--brand-green-deep)]", children: "Review Target" }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("select", { value: form.reviewType, onChange: (e) => setForm((s) => ({
            ...s,
            reviewType: e.target.value,
            productName: ""
          })), className: "w-full rounded-xl border bg-white px-4 py-3 text-sm outline-none", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("option", { value: "website", children: "Website Feedback" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("option", { value: "product", children: "Tour / Product Package" })
          ] })
        ] }),
        form.reviewType === "product" && /* @__PURE__ */ jsxRuntimeExports.jsxs("label", { className: "block space-y-1", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-xs font-semibold text-[var(--brand-green-deep)]", children: "Select Product *" }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("select", { required: true, value: form.productName, onChange: (e) => setForm((s) => ({
            ...s,
            productName: e.target.value
          })), className: "w-full rounded-xl border bg-white px-4 py-3 text-sm outline-none", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("option", { value: "", children: "Choose Tour..." }),
            catalogItems.map((c) => /* @__PURE__ */ jsxRuntimeExports.jsx("option", { value: c.title, children: c.title }, c.id))
          ] })
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("textarea", { required: true, value: form.quote, onChange: (e) => setForm((s) => ({
        ...s,
        quote: e.target.value
      })), placeholder: "Quote", rows: 3, className: "w-full rounded-xl border bg-white px-4 py-3 text-sm outline-none resize-none" }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-wrap items-center gap-4", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("label", { className: "inline-flex items-center gap-3 cursor-pointer bg-white border border-[var(--brand-green)]/15 px-4 py-2 rounded-xl hover:bg-gray-50 transition text-sm", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("input", { type: "file", accept: "image/*", onChange: handleFile, className: "hidden" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: "Upload Image (optional)" })
        ] }),
        form.imagePreview ? /* @__PURE__ */ jsxRuntimeExports.jsx("img", { src: form.imagePreview, alt: "preview", className: "h-12 w-12 rounded-full object-cover border" }) : null,
        /* @__PURE__ */ jsxRuntimeExports.jsx("button", { type: "submit", disabled: isSaving, className: "ml-auto rounded-xl bg-[var(--brand-gold)] hover:opacity-90 text-[var(--brand-green-deep)] px-6 py-2.5 font-semibold text-sm transition", children: isSaving ? "Saving…" : "Add Testimonial" })
      ] })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("h2", { className: "text-xl font-bold text-[var(--brand-green-deep)] mb-4", children: "Testimonials List" }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-4", children: [
      items.map((t) => /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-col sm:flex-row sm:items-center gap-4 border rounded-2xl p-5 bg-[var(--brand-sand)]/10 hover:bg-[var(--brand-sand)]/20 transition", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-4 flex-1", children: [
          t.image ? /* @__PURE__ */ jsxRuntimeExports.jsx("img", { src: t.image, alt: t.name, className: "h-12 w-12 rounded-full object-cover border" }) : /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "h-12 w-12 rounded-full bg-[var(--brand-green-deep)]/10 text-[var(--brand-green-deep)] flex items-center justify-center font-bold", children: t.name?.[0] ?? "?" }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-1", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "font-semibold flex flex-wrap items-center gap-2 text-sm text-[var(--brand-green-deep)]", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: t.name }),
              t.location ? /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "text-xs text-muted-foreground font-normal", children: [
                "(",
                t.location,
                ")"
              ] }) : null,
              /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "text-amber-500 font-bold ml-1", children: [
                "★".repeat(t.rating ?? 5),
                "☆".repeat(5 - (t.rating ?? 5))
              ] })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-[10px] tracking-wide uppercase font-semibold text-muted-foreground flex items-center gap-1.5", children: t.reviewType === "product" && t.productName ? /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "bg-[var(--brand-green-deep)]/10 text-[var(--brand-green-deep)] px-2 py-0.5 rounded-full", children: [
              "🧭 Tour: ",
              t.productName
            ] }) : /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "bg-amber-500/10 text-amber-800 px-2 py-0.5 rounded-full font-medium", children: "💻 Website Feedback" }) }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "text-sm italic text-foreground mt-1", children: [
              "“",
              t.quote,
              "”"
            ] })
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "sm:self-center", children: /* @__PURE__ */ jsxRuntimeExports.jsx("button", { type: "button", onClick: () => {
          if (confirm("Are you sure you want to delete this review?")) handleDelete(t.id);
        }, className: "rounded-xl px-4 py-2 bg-red-600 hover:bg-red-700 text-white text-xs font-semibold transition", children: "Delete" }) })
      ] }, t.id)),
      items.length === 0 && /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-center py-10 text-muted-foreground text-sm border-2 border-dashed rounded-2xl", children: "No testimonials found." })
    ] }),
    message ? /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "mt-4 text-sm font-semibold text-[var(--brand-green-deep)] bg-[var(--brand-sand)]/35 p-3 rounded-xl border border-[var(--brand-green)]/5 text-center", children: message }) : null
  ] }) });
}
export {
  AdminTestimonialsPage as component
};
