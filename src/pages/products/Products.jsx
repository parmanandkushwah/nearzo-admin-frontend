import React, { useMemo, useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { useForm, useFieldArray, Controller } from 'react-hook-form';
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';
import api from '../../services/api';
import { FiPlus, FiEdit, FiTrash2, FiShoppingBag, FiSearch, FiTag, FiPackage, FiDollarSign, FiImage, FiUpload, FiTrash, FiChevronLeft, FiChevronRight, FiFolder, FiX, FiEye, FiLoader } from 'react-icons/fi';

const initialProduct = {
  name: '',
  description: '',
  productCategoryId: '',
  productSubCategoryId: '',
  images: [{ alt: '', url: '', file: null }],
  variants: [{ name: '', mrp: '', image: null, imageFile: null }]
};

const API_BASE = '/products';
const CATEGORY_API = '/product-categories';

const getInputFile = (fileInput) => {
  if (!fileInput) return null;
  if (fileInput instanceof File) return fileInput;
  if (fileInput instanceof FileList) return fileInput[0] || null;
  if (Array.isArray(fileInput)) return fileInput[0] || null;
  return null;
};

const getFirstVariant = (product) => product.variants?.[0] || null;

const getProductPreviewImage = (product) => {
  const mainImage = product.images?.[0]?.url;
  if (mainImage) return mainImage;
  const firstVariantImage = getFirstVariant(product)?.image;
  if (firstVariantImage) return firstVariantImage;
  return product.variants?.find((v) => v.image)?.image || null;
};

const getProductDisplayMrp = (product) => {
  if (product.mrp) return product.mrp;
  if (product.price != null && product.price !== '') return `Rs ${product.price}`;

  const firstVariant = getFirstVariant(product);
  if (firstVariant?.mrp) return firstVariant.mrp;
  if (firstVariant?.price != null && firstVariant?.price !== '') return `Rs ${firstVariant.price}`;

  return '-';
};

const mapProductToForm = (product) => ({
  ...product,
  productCategoryId: product.productCategoryId?.toString() || '',
  productSubCategoryId: product.productSubCategoryId?.toString() || '',
  images: product.images?.length
    ? product.images.map((img) => ({ url: img.url || '', alt: img.alt || '', file: null }))
    : [{ alt: '', url: '', file: null }],
  variants: product.variants?.length
    ? product.variants.map((v) => ({ ...v, imageFile: null }))
    : initialProduct.variants
});

const MasterProducts = () => {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchProducts();
    fetchCategories();
  }, []);

  const fetchProducts = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      const response = await api.get(API_BASE, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (response.data.success) {
        setProducts(response.data.products || []);
      }
    } catch (error) {
      console.error('Failed to fetch products:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchCategories = async () => {
    try {
      const token = localStorage.getItem('token');
      
      const response = await api.get(CATEGORY_API, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      if (response.data.success) {
        setCategories(response.data.categories || []);
      }
    } catch (error) {
      console.error('Failed to fetch categories:', error);
    }
  };

  const [search, setSearch] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [detailProduct, setDetailProduct] = useState(null);
  const [detailLoadingId, setDetailLoadingId] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);
  const [selectedCategoryId, setSelectedCategoryId] = useState('');
  const [selectedSubCategoryId, setSelectedSubCategoryId] = useState('');

  const { register, handleSubmit, reset, control, setValue, watch } = useForm({
    defaultValues: initialProduct
  });

  const { fields: imageFields, append: appendImage, remove: removeImage } = useFieldArray({
    control,
    name: 'images'
  });

  const { fields: variantFields, append: appendVariant, remove: removeVariant } = useFieldArray({
    control,
    name: 'variants'
  });

  const watchedCategoryId = watch('productCategoryId');

  const selectedCategory = useMemo(() => 
    categories.find(c => c.id === parseInt(watchedCategoryId)) || null
  , [watchedCategoryId, categories]);

  const getCategoryName = (id) => categories.find(c => c.id === id)?.name || '-';
  const getSubCategoryName = (id) => categories.flatMap(c => c.subCategories).find(sc => sc.id === id)?.name || '-';

  const filteredProducts = useMemo(() => {
    return products.filter(p => {
      const matchesSearch = !search || p.name.toLowerCase().includes(search.toLowerCase());
      const matchesCategory = !selectedCategoryId || p.productCategoryId === parseInt(selectedCategoryId);
      const matchesSubCategory = !selectedSubCategoryId || p.productSubCategoryId === parseInt(selectedSubCategoryId);
      return matchesSearch && matchesCategory && matchesSubCategory;
    });
  }, [products, search, selectedCategoryId, selectedSubCategoryId]);

  const stats = useMemo(() => {
    const total = products.length;
    const withVariants = products.filter(p => p.variants?.length > 1).length;
    const totalVariants = products.reduce((sum, p) => sum + (p.variants?.length || 1), 0);
    return { total, withVariants, totalVariants };
  }, [products]);

  const totalPages = Math.ceil(filteredProducts.length / itemsPerPage);
  const paginatedProducts = filteredProducts.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const openModal = (product = null) => {
    setSelectedProduct(product);
    reset(product ? mapProductToForm(product) : initialProduct);
    setShowModal(true);
  };

  const openDetailModal = async (product) => {
    try {
      setDetailLoadingId(product.id);
      const token = localStorage.getItem('token');
      const response = await api.get(`${API_BASE}/${product.id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (response.data.success) {
        setDetailProduct(response.data.product);
        setShowDetailModal(true);
      }
    } catch (error) {
      console.error('Failed to fetch product details:', error);
    } finally {
      setDetailLoadingId(null);
    }
  };

  const closeModal = () => {
    setShowModal(false);
    setSelectedProduct(null);
    reset(initialProduct);
  };

  const closeDetailModal = () => {
    setShowDetailModal(false);
    setDetailProduct(null);
  };

  const onSubmit = async (data) => {
    try {
      const token = localStorage.getItem('token');
      const productData = new FormData();
      const variants = [];
      let variantImageIndex = 0;

      (data.variants || [])
        .filter((v) => v.name?.trim() || v.mrp || getInputFile(v.imageFile) || (v.image && !v.image.startsWith('blob:')))
        .forEach((variant, idx) => {
          const imageFile = getInputFile(variant.imageFile);
          const existingVariantImage = variant.image?.startsWith('blob:')
            ? null
            : (variant.image || null);
          const variantPayload = {
            id: variant.id,
            name: variant.name?.trim() || (idx === 0 ? 'Default' : `Variant ${idx + 1}`),
            mrp: variant.mrp,
            image: imageFile ? null : (selectedProduct ? existingVariantImage : null)
          };

          if (imageFile) {
            variantPayload.variantImageIndex = variantImageIndex;
            productData.append('variantImages', imageFile);
            variantImageIndex += 1;
          }

          variants.push(variantPayload);
        });

      (data.images || []).forEach((image) => {
        const imageFile = getInputFile(image.file);
        if (imageFile) {
          productData.append('images', imageFile);
        }
      });

      productData.append('name', data.name || '');
      productData.append('description', data.description || '');
      productData.append('productCategoryId', data.productCategoryId || '');
      productData.append('productSubCategoryId', data.productSubCategoryId || '');
      productData.append(
        'productImages',
        JSON.stringify(
          (data.images || []).map((img) => ({
            url: getInputFile(img.file) ? '' : (img.url || ''),
            alt: img.alt || ''
          }))
        )
      );
      productData.append('variants', JSON.stringify(variants));

      const requestConfig = {
        headers: { Authorization: `Bearer ${token}` }
      };

      if (selectedProduct) {
        const response = await api.put(
          `${API_BASE}/${selectedProduct.id}`,
          productData,
          requestConfig
        );
        if (response.data.success) {
          setProducts(items => items.map(p => 
            p.id === selectedProduct.id ? response.data.product : p
          ));
          alert('Product updated successfully');
        }
      } else {
        const response = await api.post(
          API_BASE,
          productData,
          requestConfig
        );
        if (response.data.success) {
          setProducts(items => [...items, response.data.product]);
          alert('Product created successfully');
        }
      }
      closeModal();
    } catch (error) {
      console.error('Failed to save product:', error);
      alert(error.response?.data?.message || 'Failed to save product');
    }
  };

  const deleteProduct = async (id) => {
    try {
      if (!window.confirm('Are you sure you want to delete this product?')) return;
      
      const token = localStorage.getItem('token');
      const response = await api.delete(`${API_BASE}/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      if (response.data.success) {
        setProducts(items => items.filter(p => p.id !== id));
        alert('Product deleted successfully');
      }
    } catch (error) {
      console.error('Failed to delete product:', error);
      alert('Failed to delete product');
    }
  };

  const Modal = ({ children }) => createPortal(
    <div className="fixed inset-0 z-50 flex min-h-screen items-center justify-center p-4">
      <div className="relative z-10 h-[90vh] w-full max-w-3xl overflow-hidden rounded-2xl border border-white/20 bg-white/[0.94] shadow-2xl shadow-slate-950/30 backdrop-blur-xl dark:border-white/10 dark:bg-[#1F2937]/[0.96]" onClick={(e) => e.stopPropagation()}>
        {children}
      </div>
    </div>,
    document.body
  );

  const DetailModal = ({ product, onClose }) => {
    const productImages = product ? (product.images || product.ProductImages || []).filter(img => img?.url) : [];
    const variants = product?.variants || [];
    const primaryImage = getProductPreviewImage(product) || '';
    const [activeImage, setActiveImage] = useState(primaryImage);

    useEffect(() => {
      setActiveImage(primaryImage);
    }, [primaryImage, product?.id]);

    if (!product) return null;

    const categoryName = product.ProductCategory?.name || getCategoryName(product.productCategoryId);
    const subCategoryName = product.ProductSubCategory?.name || getSubCategoryName(product.productSubCategoryId);
    const displayPrice = getProductDisplayMrp(product);

return createPortal(
       <div className="fixed inset-0 z-50 flex min-h-screen items-center justify-center bg-slate-950/55 p-4 backdrop-blur-sm">
         <div className="relative z-10 flex h-[92vh] w-full max-w-6xl flex-col overflow-hidden rounded-2xl border border-white/30 bg-white/[0.86] shadow-2xl shadow-slate-950/35 backdrop-blur-2xl dark:border-white/10 dark:bg-slate-950/[0.86]" onClick={(e) => e.stopPropagation()}>
           <div className="relative overflow-hidden border-b border-white/40 bg-gradient-to-br from-primary-700 via-primary-600 to-slate-900 px-6 py-5 text-white dark:border-white/10">
            <div className="absolute inset-y-0 right-0 w-1/2 bg-[radial-gradient(circle_at_70%_22%,rgba(50,211,154,0.35),transparent_18rem)]" />
            <div className="relative flex items-start justify-between gap-4">
              <div className="min-w-0">
                <div className="mb-3 flex flex-wrap gap-2">
                  <span className="status-pill bg-white/[0.14] text-white ring-1 ring-white/20">
                    Master Product
                  </span>
                  <span className="status-pill bg-accent-400/20 text-accent-100 ring-1 ring-accent-300/25">
                    {variants.length || 1} Variant{variants.length > 1 ? 's' : ''}
                  </span>
                </div>
                <h2 className="font-display text-2xl font-extrabold leading-tight text-white sm:text-3xl">
                  {product.name}
                </h2>
                <p className="mt-2 max-w-2xl text-sm leading-6 text-white/75 line-clamp-2">
                  {product.description
                    ? product.description.replace(/<[^>]*>/g, ' ')
                    : 'No description added for this product.'}
                </p>
              </div>
              <button type="button" onClick={onClose} className="icon-button shrink-0 border-white/20 bg-white/10 text-white hover:bg-white/20 hover:text-white">
                <FiX size={18} />
              </button>
            </div>
          </div>

          <div className="min-h-0 flex-1 overflow-y-auto p-6 hidden-scroll">
            <div className="grid gap-6 lg:grid-cols-[1.05fr_0.95fr]">
              <div className="space-y-4">
                <div className="overflow-hidden rounded-xl border border-white/60 bg-white/70 p-3 shadow-[0_20px_55px_-38px_rgba(31,41,55,0.5)] backdrop-blur dark:border-white/10 dark:bg-white/[0.06]">
                  <div className="flex aspect-[4/3] items-center justify-center overflow-hidden rounded-lg bg-slate-100 dark:bg-slate-900">
                    {activeImage ? (
                      <img
                        src={activeImage}
                        alt={product.name}
                        className="h-full w-full object-cover"
                        crossOrigin="anonymous"
                      />
                    ) : (
                      <div className="flex h-full w-full flex-col items-center justify-center text-slate-400 dark:text-slate-500">
                        <FiImage size={42} />
                        <span className="mt-3 text-sm font-semibold">No product image</span>
                      </div>
                    )}
                  </div>

                  {productImages.length > 1 && (
                    <div className="mt-3 grid grid-cols-5 gap-2 sm:grid-cols-6">
                      {productImages.map((img, idx) => (
                        <button
                          key={`${img.url}-${idx}`}
                          type="button"
                          onClick={() => setActiveImage(img.url)}
                          className={`aspect-square overflow-hidden rounded-lg border bg-white p-1 transition-all dark:bg-white/[0.04] ${
                            activeImage === img.url
                              ? 'border-primary-500 ring-4 ring-primary-500/15'
                              : 'border-slate-200/80 hover:border-primary-300 dark:border-white/10'
                          }`}
                        >
                          <img
                            src={img.url}
                            alt={img.alt || `${product.name} ${idx + 1}`}
                            className="h-full w-full rounded-md object-cover"
                            crossOrigin="anonymous"
                          />
                        </button>
                      ))}
                    </div>
                  )}
                </div>

                <div className="grid gap-3 sm:grid-cols-3">
                  <div className="rounded-xl border border-secondary-200/70 bg-white/75 p-4 backdrop-blur dark:border-white/10 dark:bg-white/[0.05]">
                    <p className="text-xs font-bold uppercase tracking-wide text-slate-500 dark:text-slate-400">MRP</p>
                    <p className="mt-2 font-display text-2xl font-extrabold text-emerald-700 dark:text-emerald-300">{displayPrice}</p>
                  </div>
                  <div className="rounded-xl border border-secondary-200/70 bg-white/75 p-4 backdrop-blur dark:border-white/10 dark:bg-white/[0.05]">
                    <p className="text-xs font-bold uppercase tracking-wide text-slate-500 dark:text-slate-400">Category</p>
                    <p className="mt-2 text-sm font-bold text-slate-950 dark:text-white">{categoryName}</p>
                  </div>
                  <div className="rounded-xl border border-secondary-200/70 bg-white/75 p-4 backdrop-blur dark:border-white/10 dark:bg-white/[0.05]">
                    <p className="text-xs font-bold uppercase tracking-wide text-slate-500 dark:text-slate-400">Sub Category</p>
                    <p className="mt-2 text-sm font-bold text-slate-950 dark:text-white">{subCategoryName}</p>
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <div className="rounded-xl border border-secondary-200/70 bg-white/75 p-5 shadow-[0_16px_44px_-34px_rgba(31,41,55,0.35)] backdrop-blur dark:border-white/10 dark:bg-white/[0.05]">
                  <div className="mb-4 flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary-50 text-primary-700 ring-1 ring-primary-100 dark:bg-primary-400/10 dark:text-primary-300">
                      <FiPackage size={18} />
                    </div>
                    <div>
                      <h3 className="font-display text-base font-extrabold text-slate-950 dark:text-white">Product Overview</h3>
                      <p className="text-xs font-semibold text-slate-500 dark:text-slate-400">Catalog information</p>
                    </div>
                  </div>
                    <div className="space-y-4">
                      <div>
                        <p className="text-xs font-bold uppercase tracking-wide text-slate-500 dark:text-slate-400">Description</p>
                        <div
                          className="prose prose-sm mt-2 max-w-none text-slate-600 dark:text-slate-300"
                          dangerouslySetInnerHTML={{
                            __html: product.description
                              ? product.description.replace(/<script[^>]*>[\s\S]*?<\/script>/gi, '')
                              : 'No description added for this product.'
                          }}
                        />
                      </div>
                    <div className="grid grid-cols-2 gap-3">
                      <div className="rounded-lg bg-slate-50 p-3 dark:bg-white/[0.04]">
                        <p className="text-xs font-bold text-slate-500 dark:text-slate-400">Product ID</p>
                        <p className="mt-1 text-sm font-bold text-slate-950 dark:text-white">#{product.id}</p>
                      </div>
                      <div className="rounded-lg bg-slate-50 p-3 dark:bg-white/[0.04]">
                        <p className="text-xs font-bold text-slate-500 dark:text-slate-400">Images</p>
                        <p className="mt-1 text-sm font-bold text-slate-950 dark:text-white">{productImages.length}</p>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="rounded-xl border border-secondary-200/70 bg-white/75 p-5 shadow-[0_16px_44px_-34px_rgba(31,41,55,0.35)] backdrop-blur dark:border-white/10 dark:bg-white/[0.05]">
                  <div className="mb-4 flex items-center justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-emerald-50 text-emerald-700 ring-1 ring-emerald-100 dark:bg-emerald-400/10 dark:text-emerald-300">
                        <FiTag size={18} />
                      </div>
                      <div>
                        <h3 className="font-display text-base font-extrabold text-slate-950 dark:text-white">Variants</h3>
                        <p className="text-xs font-semibold text-slate-500 dark:text-slate-400">MRP and variant images</p>
                      </div>
                    </div>
                    <span className="status-pill bg-primary-50 text-primary-700 ring-1 ring-primary-100 dark:bg-primary-400/10 dark:text-primary-300">
                      {variants.length || 0}
                    </span>
                  </div>

                  {variants.length > 0 ? (
                    <div className="grid gap-3 sm:grid-cols-2">
                      {variants.map((variant, idx) => (
                        <div key={variant.id || idx} className="group overflow-hidden rounded-xl border border-slate-200/80 bg-white/80 shadow-[0_14px_34px_-30px_rgba(31,41,55,0.55)] transition-all hover:-translate-y-0.5 hover:border-primary-300 dark:border-white/10 dark:bg-white/[0.04]">
                          <div className="flex gap-3 p-3">
                            <button
                              type="button"
                              onClick={() => variant.image && setActiveImage(variant.image)}
                              className="flex h-20 w-20 shrink-0 items-center justify-center overflow-hidden rounded-lg bg-slate-100 text-slate-400 ring-1 ring-slate-200/80 dark:bg-slate-900 dark:ring-white/10"
                            >
                              {variant.image ? (
                                <img
                                  src={variant.image}
                                  alt={variant.name || `Variant ${idx + 1}`}
                                  className="h-full w-full object-cover transition-transform group-hover:scale-105"
                                  crossOrigin="anonymous"
                                />
                              ) : (
                                <FiImage size={20} />
                              )}
                            </button>
                            <div className="min-w-0 flex-1">
                              <p className="truncate font-bold text-slate-950 dark:text-white">
                                {variant.name || `Variant ${idx + 1}`}
                              </p>
                              <p className="mt-1 text-sm font-extrabold text-emerald-700 dark:text-emerald-300">
                                {variant.mrp || (variant.price ? `Rs ${variant.price}` : '-')}
                              </p>
                              <p className="mt-3 inline-flex rounded-full bg-slate-100 px-2 py-1 text-[11px] font-bold text-slate-500 dark:bg-white/[0.06] dark:text-slate-400">
                                Variant {idx + 1}
                              </p>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="rounded-lg border border-dashed border-slate-200 p-5 text-center text-sm font-semibold text-slate-500 dark:border-white/10 dark:text-slate-400">
                      No variants added for this product.
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>,
      document.body
    );
  };

  return (
    <div className="mx-auto max-w-[1500px] space-y-6">
      <section className="brand-hero flex flex-col justify-between gap-4 rounded-lg p-6 text-white lg:flex-row lg:items-center">
        <div>
          <div className="mb-3 flex flex-wrap gap-2">
            <span className="status-pill bg-white/[0.12] text-white ring-1 ring-white/15">Master Products</span>
            <span className="status-pill bg-accent-400/20 text-accent-100 ring-1 ring-accent-300/25">Vendor Catalog</span>
          </div>
          <h1 className="font-display text-3xl font-extrabold">Master Products</h1>
          <p className="mt-2 max-w-2xl text-sm leading-6 text-white/75">
            Create product templates that vendors can select from. Add MRP, images, and variants for each product.
          </p>
        </div>
        <button onClick={() => openModal()} className="premium-button bg-white from-white to-secondary-100 text-primary-700 hover:from-white hover:to-white">
          <FiPlus size={17} />
          Add Product
        </button>
      </section>

      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <div className="panel p-5">
          <div className="flex h-11 w-11 items-center justify-center rounded-lg bg-primary-50 text-primary-700 ring-1 ring-primary-100 dark:bg-primary-400/10 dark:text-primary-300">
            <FiPackage size={21} />
          </div>
          <p className="mt-5 text-sm font-semibold text-slate-500 dark:text-slate-400">Total Products</p>
          <p className="mt-2 font-display text-3xl font-extrabold text-slate-950 dark:text-white">{stats.total}</p>
          <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">In master catalog</p>
        </div>

        <div className="panel p-5">
          <div className="flex h-11 w-11 items-center justify-center rounded-lg bg-emerald-50 text-emerald-700 ring-1 ring-emerald-100 dark:bg-emerald-400/10 dark:text-emerald-300">
            <FiTag size={21} />
          </div>
          <p className="mt-5 text-sm font-semibold text-slate-500 dark:text-slate-400">Total Variants</p>
          <p className="mt-2 font-display text-3xl font-extrabold text-slate-950 dark:text-white">{stats.totalVariants}</p>
          <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">Across all products</p>
        </div>

        <div className="panel p-5">
          <div className="flex h-11 w-11 items-center justify-center rounded-lg bg-amber-50 text-amber-700 ring-1 ring-amber-100 dark:bg-amber-400/10 dark:text-amber-300">
            <FiDollarSign size={21} />
          </div>
          <p className="mt-5 text-sm font-semibold text-slate-500 dark:text-slate-400">With Variants</p>
          <p className="mt-2 font-display text-3xl font-extrabold text-slate-950 dark:text-white">{stats.withVariants}</p>
          <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">Products with multiple variants</p>
        </div>

        <div className="panel p-5">
          <div className="flex h-11 w-11 items-center justify-center rounded-lg bg-violet-50 text-violet-700 ring-1 ring-violet-100 dark:bg-violet-400/10 dark:text-violet-300">
            <FiFolder size={21} />
          </div>
          <p className="mt-5 text-sm font-semibold text-slate-500 dark:text-slate-400">Categories</p>
          <p className="mt-2 font-display text-3xl font-extrabold text-slate-950 dark:text-white">{categories.length}</p>
          <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">Product categories</p>
        </div>
      </section>

      <section className="panel overflow-hidden">
        <div className="flex flex-col gap-3 border-b border-slate-100 p-5 dark:border-white/5 lg:flex-row lg:items-center lg:justify-between">
          <div className="relative w-full max-w-xl">
            <FiSearch className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
            <input
              type="search"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Search products..."
              className="input-premium h-11 w-full pl-11 pr-4"
            />
          </div>
          <div className="flex flex-wrap gap-2 items-center">
            <select
              value={selectedCategoryId}
              onChange={(e) => {
                setSelectedCategoryId(e.target.value);
                setSelectedSubCategoryId('');
              }}
              className="input-premium h-10 w-40 px-3 text-sm"
            >
              <option value="">All Categories</option>
              {categories.map(cat => (
                <option key={cat.id} value={cat.id}>{cat.name}</option>
              ))}
            </select>
            <select
              value={selectedSubCategoryId}
              onChange={(e) => setSelectedSubCategoryId(e.target.value)}
              className="input-premium h-10 w-40 px-3 text-sm"
              disabled={!selectedCategoryId}
            >
              <option value="">All Sub Categories</option>
              {selectedCategory?.subCategories.map(sc => (
                <option key={sc.id} value={sc.id}>{sc.name}</option>
              ))}
            </select>
            <span className="text-sm font-semibold text-slate-500 dark:text-slate-400">Showing: {filteredProducts.length}</span>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-200/50 dark:border-gray-700/50">
                <th className="text-left py-4 px-3 font-semibold">Product</th>
                <th className="text-left py-4 px-3 font-semibold">Category</th>
                <th className="text-left py-4 px-3 font-semibold">Sub Category</th>
                <th className="text-left py-4 px-3 font-semibold">MRP</th>
                <th className="text-left py-4 px-3 font-semibold">Variants</th>
                <th className="text-right py-4 px-3 font-semibold">Actions</th>
              </tr>
            </thead>
            <tbody>
              {paginatedProducts.map((product) => {
                const previewImage = getProductPreviewImage(product);
                return (
                  <tr key={product.id} className="border-b border-gray-100/50 dark:border-gray-800/50 hover:bg-gray-50/50 dark:hover:bg-gray-800/50 transition-all">
                  <td className="py-4 px-3">
                    <div className="flex items-center gap-3">
                      <div className="h-10 w-10 rounded-lg bg-slate-100 dark:bg-slate-800 overflow-hidden flex-shrink-0">
                        {previewImage ? (
                          <img src={previewImage} alt={product.name} className="h-full w-full object-cover" crossOrigin="anonymous" />
                        ) : (
                          <div className="flex h-full w-full items-center justify-center text-slate-400">
                            <FiImage size={16} />
                          </div>
                        )}
                      </div>
                      <div>
                        <p className="font-medium text-slate-950 dark:text-white">{product.name}</p>
                        <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-1">
                        {product.description
                          ? product.description.replace(/<[^>]*>/g, ' ')
                          : 'No description'}
                      </p>
                      </div>
                    </div>
                  </td>
                  <td className="py-4 px-3 text-slate-600 dark:text-gray-400">{getCategoryName(product.productCategoryId)}</td>
                  <td className="py-4 px-3 text-slate-600 dark:text-gray-400">{getSubCategoryName(product.productSubCategoryId)}</td>
                  <td className="py-4 px-3 font-semibold text-slate-950 dark:text-white">{getProductDisplayMrp(product)}</td>
                  <td className="py-4 px-3">
                    <span className="status-pill bg-primary-50 text-primary-700 ring-1 ring-primary-100 dark:bg-primary-400/10 dark:text-primary-300">
                      {product.variants?.length || 1} Variant{product.variants?.length > 1 ? 's' : ''}
                    </span>
                  </td>
                  <td className="py-4 px-3 text-right">
                    <div className="flex justify-end gap-2">
                      <button
                        onClick={() => openDetailModal(product)}
                        disabled={detailLoadingId === product.id}
                        className="ghost-button disabled:cursor-wait disabled:opacity-70"
                        title={detailLoadingId === product.id ? 'Loading details...' : 'View details'}
                      >
                        {detailLoadingId === product.id ? (
                          <FiLoader size={16} className="animate-spin" />
                        ) : (
                          <FiEye size={16} />
                        )}
                      </button>
                      <button onClick={() => openModal(product)} className="ghost-button">
                        <FiEdit size={16} />
                      </button>
                      <button onClick={() => deleteProduct(product.id)} className="ghost-button text-rose-700 dark:text-rose-300">
                        <FiTrash2 size={16} />
                      </button>
                    </div>
                  </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {filteredProducts.length === 0 && (
          <div className="p-10 text-center">
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-lg bg-slate-100 text-slate-500 dark:bg-white/10 dark:text-slate-300">
              <FiShoppingBag size={22} />
            </div>
            <p className="mt-3 font-bold text-slate-950 dark:text-white">No products found</p>
            <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">Create your first master product to get started.</p>
          </div>
        )}

        {totalPages > 1 && (
          <div className="border-t border-slate-100 p-4 dark:border-white/5">
            <div className="flex items-center justify-between">
              <p className="text-sm text-slate-500 dark:text-slate-400">
                Page {currentPage} of {totalPages}
              </p>
              <div className="flex gap-2">
                <button
                  onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                  disabled={currentPage === 1}
                  className="icon-button h-9 w-9 disabled:opacity-50"
                >
                  <FiChevronLeft size={16} />
                </button>
                <button
                  onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                  disabled={currentPage === totalPages}
                  className="icon-button h-9 w-9 disabled:opacity-50"
                >
                  <FiChevronRight size={16} />
                </button>
              </div>
            </div>
          </div>
        )}
      </section>

      {showModal && (
        <Modal>
          <form onSubmit={handleSubmit(onSubmit)} className="flex h-full flex-col">
            <div className="border-b border-white/20 bg-white px-6 py-5 dark:border-white/10 dark:bg-slate-950">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <span className="status-pill bg-teal-50 text-teal-700 ring-1 ring-teal-100 dark:bg-teal-400/10 dark:text-teal-200 dark:ring-teal-400/15">
                    Master Product
                  </span>
                  <h2 className="mt-3 font-display text-2xl font-extrabold text-slate-950 dark:text-white">
                    {selectedProduct ? 'Edit Product' : 'Add Product'}
                  </h2>
                  <p className="mt-1 text-sm leading-6 text-slate-500 dark:text-slate-400">
                    Create product templates for vendors to select from.
                  </p>
                </div>
                <button type="button" onClick={closeModal} className="icon-button shrink-0">
                  <FiX size={18} />
                </button>
              </div>
            </div>

            <div className="flex-1 min-h-0 overflow-y-auto p-6 modal-scroll">
              <div className="space-y-5">
                <div className="rounded-xl border border-slate-200/80 bg-white/80 p-5 shadow-lg backdrop-blur dark:border-white/10 dark:bg-white/[0.04]">
                  <h3 className="font-display text-base font-extrabold text-slate-950 dark:text-white mb-4">Basic Info</h3>
                  <div className="space-y-4">
                    <label className="block">
                      <span className="mb-2 block text-sm font-bold text-slate-700 dark:text-slate-200">Product Name</span>
                      <input
                        type="text"
                        required
                        {...register('name')}
                        className="input-premium h-11 w-full px-4"
                        placeholder="e.g., Basmati Rice Premium"
                      />
                    </label>

                    <label className="block">
                      <span className="mb-2 block text-sm font-bold text-slate-700 dark:text-slate-200">Description</span>
                      <div className="rounded-lg border border-slate-200/80 bg-white/80">
                        <Controller
                          name="description"
                          control={control}
                          defaultValue={selectedProduct?.description || ''}
                          render={({ field: { onChange, value } }) => (
                            <ReactQuill
                              value={value || ''}
                              onChange={onChange}
                              placeholder="Brief description of the product"
                              modules={{
                                toolbar: [
                                  [{ header: [1, 2, 3, false] }],
                                  ['bold', 'italic', 'underline', 'strike'],
                                  [{ list: 'ordered' }, { list: 'bullet' }],
                                  [{ color: [] }, { background: [] }],
                                  ['link', 'image'],
                                  ['clean']
                                ]
                              }}
                              theme="snow"
                              style={{ minHeight: '150px' }}
                            />
                          )}
                        />
                      </div>
                    </label>

                    <div className="grid grid-cols-2 gap-4">
                      <label className="block">
                        <span className="mb-2 block text-sm font-bold text-slate-700 dark:text-slate-200">Category</span>
                        <select 
                          {...register('productCategoryId')} 
                          className="input-premium h-11 w-full px-4"
                          onChange={(e) => {
                            setValue('productCategoryId', e.target.value);
                            setValue('productSubCategoryId', '');
                          }}
                        >
                          <option value="">Select Category</option>
                          {categories.map(cat => (
                            <option key={cat.id} value={cat.id}>{cat.name}</option>
                          ))}
                        </select>
                      </label>

                      <label className="block">
                        <span className="mb-2 block text-sm font-bold text-slate-700 dark:text-slate-200">Sub Category</span>
                        <select 
                          {...register('productSubCategoryId')} 
                          className="input-premium h-11 w-full px-4"
                          disabled={!selectedCategory}
                        >
                          <option value="">Select Sub Category</option>
                          {selectedCategory?.subCategories.map(sc => (
                            <option key={sc.id} value={sc.id}>{sc.name}</option>
                          ))}
                        </select>
                      </label>
                    </div>
                  </div>
                </div>

<div className="rounded-xl border border-slate-200/80 bg-white/80 p-5 shadow-lg backdrop-blur dark:border-white/10 dark:bg-white/[0.04]">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="font-display text-base font-extrabold text-slate-950 dark:text-white">Product Images</h3>
                  </div>
                  <div className="space-y-3">
                    {imageFields.map((field, index) => {
                      const imageFile = getInputFile(watch(`images.${index}.file`));
                      const filePreview = imageFile ? URL.createObjectURL(imageFile) : null;
                      const existingUrl = watch(`images.${index}.url`);
                      const previewSrc = filePreview || existingUrl || null;
                      const hasFile = !!imageFile;
                      return (
                        <div key={field.id} className="flex gap-2">
                          <div className="flex-1">
                            {previewSrc ? (
                              <img
                                src={previewSrc}
                                alt={`Preview ${index + 1}`}
                                className="mb-2 h-20 w-20 rounded-lg object-cover"
                              />
                            ) : (
                              <label className="inline-flex cursor-pointer items-center justify-center gap-2 rounded-lg bg-white px-3 py-2 text-xs font-bold text-primary-700 ring-1 ring-primary-100 hover:bg-primary-50 dark:bg-white/[0.08] dark:text-primary-300 dark:ring-white/10 dark:hover:bg-white/[0.12]">
                                <FiUpload size={14} />
                                Upload Image
                                <input
                                  type="file"
                                  accept="image/*"
                                  {...register(`images.${index}.file`)}
                                  className="sr-only"
                                />
                              </label>
                            )}
                            {hasFile && (
                              <label className="inline-flex cursor-pointer items-center justify-center gap-2 rounded-lg bg-white/80 px-3 py-2 text-xs font-bold text-primary-700 ring-1 ring-primary-100 hover:bg-primary-50 dark:bg-white/[0.08] dark:text-primary-300 dark:ring-white/10 dark:hover:bg-white/[0.12]">
                                <FiUpload size={14} />
                                Change Image
                                <input
                                  type="file"
                                  accept="image/*"
                                  {...register(`images.${index}.file`)}
                                  className="sr-only"
                                />
                              </label>
                            )}
                          </div>
                          {/* <input
                            {...register(`images.${index}.alt`)}
                            className="input-premium h-10 flex-1 px-3"
                            placeholder="Alt text"
                          /> */}
                          <button
                            type="button"
                            onClick={() => removeImage(index)}
                            className="icon-button h-10 w-10"
                          >
                            <FiTrash size={14} />
                          </button>
                        </div>
                      );
                    })}
                  </div>
                </div>

<div className="rounded-xl border border-slate-200/80 bg-white/80 p-5 shadow-lg backdrop-blur dark:border-white/10 dark:bg-white/[0.04]">
                  <div className="flex items-center justify-between mb-4">
                  <h3 className="font-display text-base font-extrabold text-slate-950 dark:text-white">Variants</h3>
                  <div className="flex items-center gap-3">
                    <span className="text-xs font-semibold text-primary-700 dark:text-primary-300">At least 1 variant required (default)</span>
                    <button
                      type="button"
                      onClick={() => appendVariant({ name: '', mrp: '', image: null, imageFile: null })}
                      className="inline-flex items-center gap-2 rounded-lg bg-primary-600 px-4 py-2 text-sm font-bold text-white shadow-sm hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2"
                    >
                      <FiPlus size={16} />
                      Add Variant
                    </button>
                  </div>
                </div>
                  <div className="space-y-4">
                    {variantFields.map((field, index) => (
                      <div key={field.id} className="rounded-lg border border-slate-200/50 bg-white/60 p-4 dark:border-white/10 dark:bg-white/[0.03]">
                        <div className="mb-3 flex items-center justify-between">
                          <span className="text-sm font-bold text-slate-700 dark:text-slate-200">
                            {index === 0 ? 'Default Variant' : `Variant ${index + 1}`}
                          </span>
                          {variantFields.length > 1 && (
                            <button
                              type="button"
                              onClick={() => removeVariant(index)}
                              className="ghost-button text-xs"
                            >
                              <FiTrash size={12} />
                            </button>
                          )}
                        </div>
                        <div className="grid gap-3 sm:grid-cols-2">
                          <input
                            {...register(`variants.${index}.name`)}
                            className="input-premium h-10 w-full px-3"
                            placeholder={index === 0 ? "Default variant (e.g., 1kg)" : "Variant name (e.g., 500g)"}
                          />
                          <input
                            {...register(`variants.${index}.mrp`)}
                            className="input-premium h-10 w-full px-3"
                            placeholder={index === 0 ? "MRP for default variant (required)" : "MRP for this variant (e.g., ₹120)"}
                          />
                        </div>
                        <div className="mt-3 rounded-lg border border-dashed border-primary-200 bg-primary-50/50 p-3 dark:border-white/10 dark:bg-white/[0.04]">
                          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                            <div className="flex items-center gap-3">
                              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg bg-white text-primary-700 ring-1 ring-primary-100 dark:bg-white/[0.08] dark:text-primary-300 dark:ring-white/10">
                                <FiUpload size={18} />
                              </div>
                              <div>
                                <p className="text-sm font-bold text-slate-800 dark:text-slate-100">Variant Image</p>
                                <p className="text-xs text-slate-500 dark:text-slate-400">Upload image for this variant</p>
                              </div>
                            </div>
                            <label className="inline-flex cursor-pointer items-center justify-center gap-2 rounded-lg bg-white px-3 py-2 text-xs font-bold text-primary-700 ring-1 ring-primary-100 hover:bg-primary-50 dark:bg-white/[0.08] dark:text-primary-300 dark:ring-white/10 dark:hover:bg-white/[0.12]">
                              <FiImage size={14} />
                              Choose Image
                              <input
                                type="file"
                                accept="image/*"
                                className="sr-only"
                                {...register(`variants.${index}.imageFile`, {
                                  onChange: (e) => {
                                    const file = e.target.files?.[0];
                                    if (file) {
                                      setValue(`variants.${index}.image`, URL.createObjectURL(file));
                                    }
                                  }
                                })}
                              />
                            </label>
                          </div>
                          {watch(`variants.${index}.image`) && (
                            <div className="mt-3 flex items-center gap-3 rounded-lg bg-white/80 p-2 ring-1 ring-slate-200/80 dark:bg-white/[0.05] dark:ring-white/10">
                              <img
                                src={watch(`variants.${index}.image`)}
                                alt={`Variant ${index + 1}`}
                                className="h-12 w-12 rounded-lg object-cover"
                                crossOrigin="anonymous"
                              />
                              <p className="text-xs font-semibold text-slate-500 dark:text-slate-400">
                                {getInputFile(watch(`variants.${index}.imageFile`)) ? 'Preview - image will be uploaded on save.' : 'Current image. Choose new file to replace.'}
                              </p>
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            <div className="flex gap-3 border-t border-white/20 bg-white/80 p-5 backdrop-blur dark:border-white/10 dark:bg-white/[0.06]">
              <button type="button" onClick={closeModal} className="ghost-button flex-1">
                Cancel
              </button>
              <button type="submit" className="premium-button flex-1">
                {selectedProduct ? 'Update Product' : 'Create Product'}
              </button>
            </div>
          </form>
        </Modal>
      )}

      {showDetailModal && (
        <DetailModal product={detailProduct} onClose={closeDetailModal} />
      )}
    </div>
  );
};

export default MasterProducts;
