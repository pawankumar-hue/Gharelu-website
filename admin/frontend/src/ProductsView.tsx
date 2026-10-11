import React, { useState, useEffect } from 'react';
import {
  Package,
  Plus,
  Search,
  Edit2,
  Trash2,
  CheckCircle2,
  XCircle,
  Upload,
  Sparkles,
  X,
  RefreshCw,
  BookOpen,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';
import { adminApi } from './adminApi';
import type { Dish, MenuCategory } from './types';
import { SectionTitle, Empty, Stamp } from './ui';

interface ProductModalProps {
  product: Partial<Dish> | null;
  categories: MenuCategory[];
  isOpen: boolean;
  onClose: () => void;
  onSave: () => void;
}

function ProductModal({ product, categories, isOpen, onClose, onSave }: ProductModalProps) {
  const isEditing = Boolean(product && product.id);

  const [formData, setFormData] = useState<Partial<Dish>>(() => ({
    id: product?.id || '',
    name: product?.name || '',
    category: product?.category || (categories[0]?.id || 'makhana'),
    price: product?.price || 129,
    description: product?.description || '',
    image: product?.image || 'mk-bhopali-masala',
    ingredients: product?.ingredients || ['Popped Fox Nuts', 'Desi Ghee', 'Rock Salt'],
    dietaryTags: product?.dietaryTags || ['100% Preservative-Free', 'Pure Veg', '48h Fresh'],
    spiceLevel: product?.spiceLevel !== undefined ? product.spiceLevel : 1,
    veg: product?.veg !== undefined ? product.veg : true,
    bestseller: product?.bestseller || false,
    available: product?.available !== undefined ? product.available : true,
    weight: product?.weight || '50g Stand-up Pouch',
    shelfLife: product?.shelfLife || '48h Fresh Stamped',
    fresh: product?.fresh !== undefined ? product.fresh : true,
    pptHero: product?.pptHero || false,
  }));

  const [rawIngredients, setRawIngredients] = useState(() =>
    Array.isArray(product?.ingredients) ? product?.ingredients.join(', ') : ''
  );
  const [rawTags, setRawTags] = useState(() =>
    Array.isArray(product?.dietaryTags) ? product?.dietaryTags.join(', ') : '100% Preservative-Free, Pure Veg'
  );

  const [uploading, setUploading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (isOpen) {
      setFormData({
        id: product?.id || '',
        name: product?.name || '',
        category: product?.category || (categories[0]?.id || 'makhana'),
        price: product?.price || 129,
        description: product?.description || '',
        image: product?.image || 'mk-bhopali-masala',
        ingredients: product?.ingredients || ['Popped Fox Nuts', 'Desi Ghee', 'Rock Salt'],
        dietaryTags: product?.dietaryTags || ['100% Preservative-Free', 'Pure Veg', '48h Fresh'],
        spiceLevel: product?.spiceLevel !== undefined ? product.spiceLevel : 1,
        veg: product?.veg !== undefined ? product.veg : true,
        bestseller: product?.bestseller || false,
        available: product?.available !== undefined ? product.available : true,
        weight: product?.weight || '50g Stand-up Pouch',
        shelfLife: product?.shelfLife || '48h Fresh Stamped',
        fresh: product?.fresh !== undefined ? product.fresh : true,
        pptHero: product?.pptHero || false,
      });
      setRawIngredients(Array.isArray(product?.ingredients) ? product?.ingredients.join(', ') : '');
      setRawTags(
        Array.isArray(product?.dietaryTags) ? product?.dietaryTags.join(', ') : '100% Preservative-Free, Pure Veg'
      );
      setError('');
    }
  }, [isOpen, product, categories]);

  if (!isOpen) return null;

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    setError('');

    const reader = new FileReader();
    reader.onload = async () => {
      try {
        const base64 = reader.result as string;
        const res = await adminApi.uploadImage(base64, file.name);
        setFormData((prev) => ({ ...prev, image: res.imageUrl }));
      } catch (err: any) {
        setError(err.message || 'Image upload failed');
      } finally {
        setUploading(false);
      }
    };
    reader.onerror = () => {
      setError('Failed to read file locally.');
      setUploading(false);
    };
    reader.readAsDataURL(file);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSaving(true);

    try {
      const payload: Partial<Dish> = {
        ...formData,
        price: Number(formData.price),
        ingredients: rawIngredients.split(',').map((s) => s.trim()).filter(Boolean),
        dietaryTags: rawTags.split(',').map((s) => s.trim()).filter(Boolean),
      };

      if (isEditing && product?.id) {
        await adminApi.updateProduct(product.id, payload);
      } else {
        await adminApi.createProduct(payload);
      }

      onSave();
      onClose();
    } catch (err: any) {
      setError(err.message || 'Failed to save product');
    } finally {
      setSaving(false);
    }
  };

  const flags: Array<{ key: keyof Dish; label: string }> = [
    { key: 'available', label: 'In stock / live' },
    { key: 'bestseller', label: 'Bestseller' },
    { key: 'pptHero', label: 'Pitch deck hero' },
    { key: 'veg', label: 'Pure vegetarian' },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/55 backdrop-blur-sm p-0 sm:p-4">
      <div className="fixed inset-0" onClick={onClose} aria-hidden="true" />
      <div className="relative w-full max-w-2xl max-h-[92vh] flex flex-col bg-[var(--paper)] paper-grain border border-[var(--rule)] rounded-t-3xl sm:rounded-3xl shadow-2xl overflow-hidden z-10 slide-up-modal">
        {/* Header — a fresh sheet */}
        <div className="shrink-0 relative px-5 sm:px-6 pt-4 pb-3 border-b border-[var(--rule)] bg-[var(--paper)]">
          <div className="flex w-full items-center justify-between gap-3">
            <div className="flex items-center gap-2.5 min-w-0">
              <span className="w-9 h-9 rounded-xl bg-[#681121]/8 border-2 border-dashed border-[#681121]/30 text-[#681121] flex items-center justify-center shrink-0">
                <Package size={17} />
              </span>
              <div className="min-w-0">
                <p className="font-note text-[9px] font-semibold uppercase tracking-[0.2em] text-[#b87319]">
                  {isEditing ? 'Editing recipe card' : 'New recipe card'}
                </p>
                <h2 className="font-hand italic text-xl text-[#540c19] truncate leading-tight">
                  {isEditing ? product?.name : 'Create a new Gharelu snack'}
                </h2>
              </div>
            </div>
            <button
              type="button"
              onClick={onClose}
              className="rounded-full bg-[var(--paper-2)] border border-[var(--rule)] p-1.5 text-[var(--ink-soft)] hover:bg-[var(--paper-3)] transition-colors"
            >
              <X size={18} />
            </button>
          </div>
        </div>

        {error && (
          <div className="mx-5 sm:mx-6 mt-4 p-3 rounded-xl border-2 border-dashed border-[#681121]/40 bg-[#681121]/8 text-[#681121] font-note text-xs font-semibold flex items-center gap-2">
            <span className="stamp tilt-l-sm text-[#681121] border-[#681121]/45">Error</span>
            <span>{error}</span>
          </div>
        )}

        {/* Body */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto custom-scrollbar px-5 sm:px-6 py-5 space-y-5">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="sc-label">Product title / name *</label>
              <input
                type="text"
                required
                value={formData.name || ''}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="e.g. Royal Ghee Roasted Makhana"
                className="form-blank px-3.5 py-2.5 text-sm"
              />
            </div>

            <div>
              <label className="sc-label">Chapter / category *</label>
              <select
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                className="sc-select px-3.5 py-2.5 text-sm"
              >
                {categories.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="sc-label">Price (₹ INR) *</label>
              <input
                type="number"
                required
                min="0"
                value={formData.price ?? 129}
                onChange={(e) => setFormData({ ...formData, price: Number(e.target.value) })}
                className="form-blank px-3.5 py-2.5 text-sm"
              />
            </div>

            <div>
              <label className="sc-label">Weight / pack size</label>
              <input
                type="text"
                value={formData.weight || ''}
                onChange={(e) => setFormData({ ...formData, weight: e.target.value })}
                placeholder="e.g. 50g Stand-up Pouch"
                className="form-blank px-3.5 py-2.5 text-sm"
              />
            </div>

            <div>
              <label className="sc-label">Spice level (0–3)</label>
              <select
                value={formData.spiceLevel}
                onChange={(e) => setFormData({ ...formData, spiceLevel: Number(e.target.value) as any })}
                className="sc-select px-3.5 py-2.5 text-sm"
              >
                <option value={0}>0 — Mild / none</option>
                <option value={1}>1 — Gentle spice</option>
                <option value={2}>2 — Medium chatpata</option>
                <option value={3}>3 — Hot Bhopali teekha</option>
              </select>
            </div>
          </div>

          <div>
            <label className="sc-label">Description / pitch note</label>
            <textarea
              rows={3}
              value={formData.description || ''}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="Describe the roast quality, aroma, ingredients…"
              className="form-blank px-3.5 py-2.5 text-sm"
            />
          </div>

          {/* Image upload & preview — taped-in polaroid */}
          <div className="p-4 rounded-2xl bg-[var(--paper-2)] border border-[var(--rule)]">
            <label className="sc-label">Product photo</label>
            <div className="flex flex-col sm:flex-row items-center gap-4">
              <div className="bg-white p-2 rounded-sm border border-[var(--rule)] shadow-[4px_6px_0_rgba(84,12,25,0.08)] shrink-0">
                <div className="w-20 h-20 overflow-hidden bg-[var(--paper-3)] flex items-center justify-center">
                  {formData.image ? (
                    <img
                      src={
                        formData.image.startsWith('/') || formData.image.includes('.')
                          ? formData.image
                          : `/images/${formData.image}.jpg`
                      }
                      alt="Preview"
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        (e.target as HTMLImageElement).style.visibility = 'hidden';
                      }}
                    />
                  ) : (
                    <Package className="text-[var(--ink-faint)]" size={30} />
                  )}
                </div>
              </div>

              <div className="flex-1 w-full space-y-2">
                <input
                  type="text"
                  value={formData.image || ''}
                  onChange={(e) => setFormData({ ...formData, image: e.target.value })}
                  placeholder="Image path or name — e.g. mk-bhopali-masala"
                  className="form-blank px-3.5 py-2 text-xs"
                />

                <label className="btn-outline cursor-pointer inline-flex items-center gap-2 font-note text-xs font-semibold px-3.5 py-2">
                  <Upload size={14} />
                  <span>{uploading ? 'Uploading to server…' : 'Upload new photo'}</span>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleFileUpload}
                    className="hidden"
                    disabled={uploading}
                  />
                </label>
              </div>
            </div>
          </div>

          <div>
            <label className="sc-label">Ingredients (comma separated)</label>
            <input
              type="text"
              value={rawIngredients}
              onChange={(e) => setRawIngredients(e.target.value)}
              placeholder="Popped Fox Nuts, Desi Ghee, Ratlam Spices…"
              className="form-blank px-3.5 py-2.5 text-sm"
            />
          </div>

          <div>
            <label className="sc-label">Dietary badges (comma separated)</label>
            <input
              type="text"
              value={rawTags}
              onChange={(e) => setRawTags(e.target.value)}
              placeholder="100% Preservative-Free, Pure Veg, 48h Fresh…"
              className="form-blank px-3.5 py-2.5 text-sm"
            />
          </div>

          {/* Flags — stamped checkboxes */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-1">
            {flags.map((flag) => (
              <label
                key={flag.key}
                className="flex items-center gap-2 p-2.5 rounded-xl border-2 border-dashed border-[var(--rule)] bg-[var(--paper-2)] font-note text-xs font-semibold text-[var(--ink-soft)] cursor-pointer hover:border-[#681121]/40 transition-colors"
              >
                <input
                  type="checkbox"
                  checked={Boolean(formData[flag.key])}
                  onChange={(e) => setFormData({ ...formData, [flag.key]: e.target.checked } as any)}
                  className="rounded accent-[#681121]"
                />
                <span>{flag.label}</span>
              </label>
            ))}
          </div>

          {/* Footer */}
          <div className="pt-4 border-t border-[var(--rule)] flex items-center justify-end gap-3">
            <button type="button" onClick={onClose} className="btn-outline font-note text-xs font-semibold px-5 py-2.5">
              Cancel
            </button>
            <button
              type="submit"
              disabled={saving}
              className="btn-ink font-note text-xs font-semibold uppercase tracking-[0.12em] px-6 py-2.5 disabled:opacity-60"
            >
              {saving ? 'Stamping…' : isEditing ? 'Update product' : 'Add to website'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

/* ─────────────────────────────────────────────────────────────
   Chapter (category) editor — the index tabs of the recipe box
   ───────────────────────────────────────────────────────────── */

const ARCHETYPES: Array<MenuCategory['archetype']> = [
  'bowl',
  'plate',
  'dessert',
  'glass',
  'round',
  'grill',
  'cup',
];

function ChapterModal({
  chapter,
  isOpen,
  onClose,
  onSave,
}: {
  chapter: Partial<MenuCategory> | null;
  isOpen: boolean;
  onClose: () => void;
  onSave: () => void;
}) {
  const isEditing = Boolean(chapter && chapter.id);
  const [form, setForm] = useState<Partial<MenuCategory>>({
    id: chapter?.id || '',
    name: chapter?.name || '',
    eyebrow: chapter?.eyebrow || '',
    line: chapter?.line || '',
    archetype: chapter?.archetype || 'bowl',
    tint: chapter?.tint || '#8b1a1a',
  });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (isOpen) {
      setForm({
        id: chapter?.id || '',
        name: chapter?.name || '',
        eyebrow: chapter?.eyebrow || `Chapter ${String(Date.now()).slice(-2)}`,
        line: chapter?.line || '',
        archetype: chapter?.archetype || 'bowl',
        tint: chapter?.tint || '#8b1a1a',
      });
      setError('');
    }
  }, [isOpen, chapter]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSaving(true);
    try {
      if (isEditing && chapter?.id) {
        await adminApi.updateCategory(chapter.id, form);
      } else {
        await adminApi.createCategory({
          ...form,
          id: (form.id || form.name || '').toLowerCase().trim().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, ''),
        });
      }
      onSave();
      onClose();
    } catch (err: any) {
      setError(err.message || 'Failed to save chapter');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/55 backdrop-blur-sm p-0 sm:p-4">
      <div className="fixed inset-0" onClick={onClose} aria-hidden="true" />
      <div className="relative w-full max-w-lg max-h-[92vh] flex flex-col bg-[var(--paper)] paper-grain border border-[var(--rule)] rounded-t-3xl sm:rounded-3xl shadow-2xl overflow-hidden z-10 slide-up-modal">
        <div className="shrink-0 relative px-5 sm:px-6 pt-4 pb-3 border-b border-[var(--rule)] bg-[var(--paper)]">
          <span className="tape w-16 -top-2.5 left-10 rotate-[-4deg]" aria-hidden="true" />
          <div className="flex w-full items-center justify-between gap-3">
            <div>
              <p className="font-note text-[9px] font-semibold uppercase tracking-[0.2em] text-[#b87319]">
                {isEditing ? 'Editing chapter' : 'New chapter'}
              </p>
              <h2 className="font-hand italic text-xl text-[#540c19] leading-tight">
                {isEditing ? chapter?.name : 'Add a menu chapter'}
              </h2>
            </div>
            <button
              type="button"
              onClick={onClose}
              className="rounded-full bg-[var(--paper-2)] border border-[var(--rule)] p-1.5 text-[var(--ink-soft)] hover:bg-[var(--paper-3)] transition-colors"
            >
              <X size={18} />
            </button>
          </div>
        </div>

        {error && (
          <div className="mx-5 sm:mx-6 mt-4 p-3 rounded-xl border-2 border-dashed border-[#681121]/40 bg-[#681121]/8 text-[#681121] font-note text-xs font-semibold">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto custom-scrollbar px-5 sm:px-6 py-5 space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="sc-label">Chapter name *</label>
              <input
                type="text"
                required
                value={form.name || ''}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                placeholder="e.g. WINTER THAAL BOXES"
                className="form-blank px-3.5 py-2.5 text-sm"
              />
            </div>
            <div>
              <label className="sc-label">Slug / ID</label>
              <input
                type="text"
                disabled={isEditing}
                value={form.id || ''}
                onChange={(e) => setForm({ ...form, id: e.target.value })}
                placeholder="winter-thaals"
                className="form-blank px-3.5 py-2.5 text-sm disabled:opacity-60"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="sc-label">Eyebrow (chapter no.)</label>
              <input
                type="text"
                value={form.eyebrow || ''}
                onChange={(e) => setForm({ ...form, eyebrow: e.target.value })}
                placeholder="Chapter 08"
                className="form-blank px-3.5 py-2.5 text-sm"
              />
            </div>
            <div>
              <label className="sc-label">Frame style</label>
              <select
                value={form.archetype}
                onChange={(e) => setForm({ ...form, archetype: e.target.value as MenuCategory['archetype'] })}
                className="sc-select px-3.5 py-2.5 text-sm"
              >
                {ARCHETYPES.map((a) => (
                  <option key={a} value={a}>
                    {a}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className="sc-label">Chapter line (subtitle)</label>
            <input
              type="text"
              value={form.line || ''}
              onChange={(e) => setForm({ ...form, line: e.target.value })}
              placeholder="Popped Lotus Seeds · 100% Roasted, Never Fried"
              className="form-blank px-3.5 py-2.5 text-sm"
            />
          </div>

          <div>
            <label className="sc-label">Chapter ink tint</label>
            <div className="flex items-center gap-3">
              <input
                type="color"
                value={form.tint || '#8b1a1a'}
                onChange={(e) => setForm({ ...form, tint: e.target.value })}
                className="h-10 w-14 rounded-lg border border-[var(--rule)] bg-[var(--paper-2)] cursor-pointer"
              />
              <input
                type="text"
                value={form.tint || ''}
                onChange={(e) => setForm({ ...form, tint: e.target.value })}
                className="form-blank px-3.5 py-2.5 text-sm flex-1"
              />
            </div>
          </div>

          <div className="pt-3 border-t border-[var(--rule)] flex items-center justify-end gap-3">
            <button type="button" onClick={onClose} className="btn-outline font-note text-xs font-semibold px-5 py-2.5">
              Cancel
            </button>
            <button
              type="submit"
              disabled={saving}
              className="btn-ink font-note text-xs font-semibold uppercase tracking-[0.12em] px-6 py-2.5 disabled:opacity-60"
            >
              {saving ? 'Stamping…' : isEditing ? 'Update chapter' : 'Add chapter'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default function ProductsView() {
  const [products, setProducts] = useState<Dish[]>([]);
  const [categories, setCategories] = useState<MenuCategory[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selectedCat, setSelectedCat] = useState('all');
  const [availabilityFilter, setAvailabilityFilter] = useState('');

  const [activeModalProduct, setActiveModalProduct] = useState<Partial<Dish> | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const [chapters, setChapters] = useState<MenuCategory[]>([]);
  const [chapterModalOpen, setChapterModalOpen] = useState(false);
  const [activeChapter, setActiveChapter] = useState<Partial<MenuCategory> | null>(null);
  const [showChapters, setShowChapters] = useState(false);

  const loadChapters = async () => {
    try {
      const res = await adminApi.getCategories();
      setChapters(res.categories);
    } catch (err) {
      console.error('Failed to load chapters', err);
    }
  };

  useEffect(() => {
    loadChapters();
  }, []);

  const handleDeleteChapter = async (c: MenuCategory) => {
    if (!window.confirm(`Remove the "${c.name}" chapter from the customer app?`)) return;
    try {
      await adminApi.deleteCategory(c.id);
      loadChapters();
      loadData();
    } catch (err: any) {
      alert(err.message || 'This chapter still holds products — reassign or delete them first.');
    }
  };

  const loadData = async () => {
    try {
      setLoading(true);
      const res = await adminApi.getProducts({
        category: selectedCat !== 'all' ? selectedCat : undefined,
        search: search.trim() || undefined,
        available: availabilityFilter || undefined,
      });
      setProducts(res.products);
      setCategories(res.categories);
      loadChapters();
    } catch (err) {
      console.error('Failed to load products', err);
    } finally {
      setLoading(false);
    }
  };

  React.useEffect(() => {
    loadData();
  }, [selectedCat, availabilityFilter]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    loadData();
  };

  const handleToggle = async (id: string) => {
    try {
      await adminApi.toggleProduct(id);
      loadData();
    } catch (err) {
      alert('Error toggling availability');
    }
  };

  const handleDelete = async (id: string, name: string) => {
    if (!window.confirm(`Are you sure you want to remove "${name}" from the store?`)) return;
    try {
      await adminApi.deleteProduct(id);
      loadData();
    } catch (err) {
      alert('Error deleting product');
    }
  };

  const liveCount = products.filter((p) => p.available).length;
  const soldOut = products.length - liveCount;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-4">
        <SectionTitle
          eyebrow="Recipe cards · Inventory"
          subtitle="Pricing, photos and live availability on the customer app."
          action={
            <span className="stamp tilt-r-sm text-[#681121] border-[#681121]/45">
              {products.length} items
            </span>
          }
        >
          Product &amp; menu inventory
        </SectionTitle>

        <button
          onClick={() => {
            setActiveModalProduct(null);
            setIsModalOpen(true);
          }}
          className="btn-ink flex items-center gap-2 font-note text-xs font-semibold uppercase tracking-[0.12em] px-4 py-2.5 self-start"
        >
          <Plus size={16} />
          Add new product
        </button>
      </div>

      {/* Summary stamps */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="sc-card px-4 py-3">
          <span className="font-note text-[10px] font-semibold uppercase tracking-[0.16em] text-[var(--ink-faint)]">
            Catalog
          </span>
          <p className="font-hand text-2xl font-semibold text-[#540c19] leading-tight">{products.length}</p>
        </div>
        <div className="sc-card px-4 py-3">
          <span className="font-note text-[10px] font-semibold uppercase tracking-[0.16em] text-[#3d7044]">
            In stock
          </span>
          <p className="font-hand text-2xl font-semibold text-[#3d7044] leading-tight">{liveCount}</p>
        </div>
        <div className="sc-card px-4 py-3">
          <span className="font-note text-[10px] font-semibold uppercase tracking-[0.16em] text-[#b87319]">
            Sold out
          </span>
          <p className="font-hand text-2xl font-semibold text-[#b87319] leading-tight">{soldOut}</p>
        </div>
        <div className="sc-card px-4 py-3">
          <span className="font-note text-[10px] font-semibold uppercase tracking-[0.16em] text-[var(--ink-faint)]">
            Chapters
          </span>
          <p className="font-hand text-2xl font-semibold text-[#540c19] leading-tight">
            {categories.length}
          </p>
        </div>
      </div>

      {/* ===== Chapters — optional collapse ===== */}
      <div className="sc-card p-4 transition-all">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <button
            type="button"
            onClick={() => setShowChapters((prev) => !prev)}
            className="flex items-center gap-2 text-left group"
          >
            <span className="w-8 h-8 rounded-lg border border-[var(--rule)] bg-[var(--paper-2)] flex items-center justify-center text-[var(--ink-soft)] group-hover:border-[#681121]">
              {showChapters ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
            </span>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-hand italic text-lg text-[#540c19]">Menu Chapters &amp; Categories</span>
                <span className="stamp text-[#3d7044] border-[#4E8B56]/50 text-[10px]">
                  {chapters.length} chapters
                </span>
              </div>
              <p className="font-note text-[11px] text-[var(--ink-faint)]">
                {showChapters ? 'Click to collapse chapters' : 'Click to view, add or edit category tabs'}
              </p>
            </div>
          </button>

          {showChapters && (
            <button
              onClick={() => {
                setActiveChapter(null);
                setChapterModalOpen(true);
              }}
              className="btn-ink flex items-center gap-2 font-note text-xs font-semibold uppercase tracking-[0.12em] px-4 py-2 self-start sm:self-auto"
            >
              <Plus size={15} />
              New chapter
            </button>
          )}
        </div>

        {showChapters && (
          <div className="mt-4 pt-4 border-t border-[var(--rule)] grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3">
            {chapters.map((c, i) => (
              <div
                key={c.id}
                className={`sc-card !rounded-xl p-3.5 flex items-start gap-3 ${i % 2 === 0 ? 'tilt-l-sm' : 'tilt-r-sm'}`}
              >
                <span
                  className="w-10 h-10 rounded-lg border-2 border-dashed border-[var(--rule)] flex items-center justify-center shrink-0"
                  style={{ background: `${c.tint}1f` }}
                  aria-hidden="true"
                >
                  <span className="w-4 h-4 rounded-full" style={{ background: c.tint }} />
                </span>

                <div className="min-w-0 flex-1">
                  <p className="font-note text-[9px] font-semibold uppercase tracking-[0.18em] text-[#b87319]">
                    {c.eyebrow}
                  </p>
                  <p className="font-hand italic text-lg text-[#540c19] truncate leading-tight">{c.name}</p>
                  <p className="font-note text-[11px] text-[var(--ink-faint)] truncate">{c.line || '—'}</p>
                  <span className="stamp mt-1.5 inline-flex text-[var(--ink-soft)]">
                    {c.count ?? 0} SKUs · {c.id}
                  </span>
                </div>

                <div className="flex flex-col gap-1.5 shrink-0">
                  <button
                    onClick={() => {
                      setActiveChapter(c);
                      setChapterModalOpen(true);
                    }}
                    className="btn-outline flex items-center gap-1.5 font-note text-[11px] font-semibold px-2.5 py-1.5"
                  >
                    <Edit2 size={12} />
                    Edit
                  </button>
                  <button
                    onClick={() => handleDeleteChapter(c)}
                    className="flex items-center gap-1.5 rounded-[0.7rem] px-2.5 py-1.5 font-note text-[11px] font-semibold border-2 border-dashed border-[var(--rule)] bg-[var(--paper-3)]/60 text-[var(--ink-faint)] hover:text-[#681121] hover:border-[#681121]/40 transition-colors"
                  >
                    <Trash2 size={12} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Filter & search — the recipe box lid */}
      <div className="sc-card p-3 flex flex-wrap items-center justify-between gap-3">
        <form onSubmit={handleSearchSubmit} className="flex-1 min-w-[240px] relative">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--ink-faint)]" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by snack name, ingredients or ID…"
            className="form-blank w-full pl-9 pr-3 py-2 font-note text-xs text-[var(--ink)] outline-none focus:border-[#681121]"
          />
        </form>

        <div className="flex items-center gap-2.5 flex-wrap">
          <select
            value={selectedCat}
            onChange={(e) => setSelectedCat(e.target.value)}
            className="sc-select w-auto py-2 text-xs"
          >
            <option value="all">All chapters</option>
            {categories.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>

          <select
            value={availabilityFilter}
            onChange={(e) => setAvailabilityFilter(e.target.value)}
            className="sc-select w-auto py-2 text-xs"
          >
            <option value="">All stock status</option>
            <option value="true">In stock</option>
            <option value="false">Sold out / hidden</option>
          </select>

          <button onClick={loadData} title="Refresh list" className="btn-outline flex items-center gap-1.5 font-note text-xs font-semibold px-3 py-2">
            <RefreshCw size={14} />
          </button>
        </div>
      </div>

      {/* Product cards — recipe cards pinned to the board */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
          {[0, 1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="sc-skeleton h-72 rounded-2xl" />
          ))}
        </div>
      ) : products.length === 0 ? (
        <Empty
          title="No recipe card found"
          sub="Nothing matches these filters. Clear them to see the whole recipe box again."
          cta="Clear filters"
          onCta={() => {
            setSearch('');
            setSelectedCat('all');
            setAvailabilityFilter('');
          }}
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
          {products.map((item, idx) => {
            const imgSrc =
              item.image?.startsWith('/') || item.image?.includes('.')
                ? item.image
                : `/images/${item.image}.jpg`;

            return (
              <div
                key={item.id}
                className={`sc-card sc-card-hover relative overflow-hidden p-4 flex flex-col ${
                  idx % 2 === 0 ? 'tilt-l-sm' : 'tilt-r-sm'
                } hover:tilt-0`}
              >
                {/* Polaroid frame */}
                <div className="relative">
                  <span className="tape w-16 top-2 left-1/2 -translate-x-1/2 rotate-[-3deg] z-10" aria-hidden="true" />

                  <div className="bg-white p-2 pb-7 rounded-sm border border-[var(--rule)] shadow-[4px_6px_0_rgba(84,12,25,0.08),0_20px_40px_-24px_rgba(84,12,25,0.5)]">
                    <div className="h-32 w-full overflow-hidden bg-[var(--paper-3)]">
                      <img
                        src={imgSrc}
                        alt={item.name}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        onError={(e) => {
                          (e.target as HTMLElement).style.visibility = 'hidden';
                        }}
                      />
                    </div>
                    <p className="font-hand italic text-sm text-[var(--ink-soft)] text-center mt-2 leading-none">
                      {item.weight || 'Gharelu Hub batch'}
                    </p>
                  </div>

                  {/* Ink stamps over the photo */}
                  <span className="stamp tilt-l-sm absolute top-4 left-4 bg-[var(--paper-2)]/95 text-[#681121] border-[#681121]/40">
                    {item.category}
                  </span>

                  <button
                    onClick={() => handleToggle(item.id)}
                    className={`stamp absolute top-4 right-4 bg-[var(--paper-2)]/95 ${
                      item.available
                        ? 'tilt-r-sm text-[#3d7044] border-[#4E8B56]/60'
                        : 'tilt-r-sm text-[#b87319] border-[#D48924]/60'
                    }`}
                  >
                    {item.available ? <CheckCircle2 size={11} /> : <XCircle size={11} />}
                    {item.available ? 'Available' : 'Sold out'}
                  </button>
                </div>

                {/* Details */}
                <div className="pt-3.5 flex-1 flex flex-col">
                  <div className="flex items-start justify-between gap-2">
                    <h3 className="font-hand italic text-xl text-[#540c19] tracking-tight leading-snug">
                      {item.name}
                    </h3>
                    <div className="flex items-center gap-1 shrink-0">
                      {item.bestseller && (
                        <span className="stamp text-[#b87319] border-[#D48924]/50">
                          <Sparkles size={10} /> Best
                        </span>
                      )}
                      {item.pptHero && <span className="stamp text-[#681121] border-[#681121]/45">Hero</span>}
                    </div>
                  </div>

                  <p className="font-note text-[11px] text-[var(--ink-faint)] line-clamp-2 mt-1 leading-relaxed">
                    {item.description}
                  </p>

                  <div className="flex items-baseline gap-2 mt-2.5">
                    <span className="font-hand text-xl font-semibold text-[#681121]">₹{item.price}</span>
                    {item.weight && (
                      <span className="font-note text-[10px] text-[var(--ink-faint)]">· {item.weight}</span>
                    )}
                  </div>

                  <div className="mt-auto pt-3 border-t border-dashed border-[var(--rule)] flex items-center justify-between gap-2">
                    <span className="font-note text-[10px] text-[var(--ink-faint)] truncate max-w-[45%]">
                      ID: {item.id}
                    </span>

                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => {
                          setActiveModalProduct(item);
                          setIsModalOpen(true);
                        }}
                        className="btn-outline flex items-center gap-1.5 font-note text-xs font-semibold px-3 py-1.5"
                        title="Edit product"
                      >
                        <Edit2 size={13} />
                        Edit
                      </button>
                      <button
                        onClick={() => handleDelete(item.id, item.name)}
                        className="flex items-center gap-1.5 rounded-[0.7rem] px-3 py-1.5 font-note text-xs font-semibold border-2 border-dashed border-[var(--rule)] bg-[var(--paper-3)]/60 text-[var(--ink-faint)] hover:text-[#681121] hover:border-[#681121]/40 transition-colors"
                        title="Delete product"
                      >
                        <Trash2 size={13} />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      <ProductModal
        isOpen={isModalOpen}
        product={activeModalProduct}
        categories={categories}
        onClose={() => setIsModalOpen(false)}
        onSave={loadData}
      />

      <ChapterModal
        isOpen={chapterModalOpen}
        chapter={activeChapter}
        onClose={() => setChapterModalOpen(false)}
        onSave={() => {
          loadChapters();
          loadData();
        }}
      />
    </div>
  );
}
