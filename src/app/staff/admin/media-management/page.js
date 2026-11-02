"use client";

import { useEffect, useState } from "react";

import {
  Newspaper,
  Images,
  Plus,
  ArrowRight,
  X,
  Eye,
  Pencil,
  Trash2,
  AlertTriangle,
  CheckCircle,
  Upload,
  Image as ImageIcon,
} from "lucide-react";

import { auth } from "@/lib/firebase";
import { onAuthStateChanged } from "firebase/auth";
import StaffSidebar from "@/components/staff/StaffSidebar";
import ShellPage from "@/components/layout/ShellPage";
import LoadingState from "@/components/ui/LoadingState";
import PageHeader from "@/components/ui/PageHeader";

export default function MediaManagementPage() {
  const [activeSection, setActiveSection] = useState("news");

  const [newsArticles, setNewsArticles] = useState([]);
  const [galleryImages, setGalleryImages] = useState([]);
  const [loadingNews, setLoadingNews] = useState(true);
  const [loadingGallery, setLoadingGallery] = useState(true);

  const [showNewsForm, setShowNewsForm] = useState(false);
  const [showGalleryForm, setShowGalleryForm] = useState(false);
  const [showViewModal, setShowViewModal] = useState(false);

  const [viewItem, setViewItem] = useState(null);
  const [viewType, setViewType] = useState(null);

  const [editingNews, setEditingNews] = useState(null);
  const [editingGallery, setEditingGallery] = useState(null);

  const [submitting, setSubmitting] = useState(false);
  const [deletingId, setDeletingId] = useState(null);

  const [message, setMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [newsFormError, setNewsFormError] = useState("");
  const [galleryFormError, setGalleryFormError] = useState("");

  const [newsFilter, setNewsFilter] = useState("all");
  const [galleryFilter, setGalleryFilter] = useState("all");

  // ============================================================
  // FORM STATE
  // ============================================================
  const [newsForm, setNewsForm] = useState({
    title: "",
    slug: "",
    category: "News",
    excerpt: "",
    content: "",
    featured_image_url: "",
    image_contains_learners: false,
    consent_confirmed: false,
    published: false,
  });

  const [newsImageFile, setNewsImageFile] = useState(null);
  const [newsImagePreview, setNewsImagePreview] = useState("");

  const [galleryForm, setGalleryForm] = useState({
    image_url: "",
    title: "",
    caption: "",
    alt_text: "",
    category: "School Events",
    photo_type: "general",
    consent_confirmed: false,
    published: false,
  });

  const [galleryImageFile, setGalleryImageFile] = useState(null);
  const [galleryImagePreview, setGalleryImagePreview] = useState("");

  // ============================================================
  // AUTH & DATA LOADING
  // ============================================================
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        loadNews();
        loadGallery();
      } else {
        setErrorMessage("You must be logged in to access Media Management.");
        setLoadingNews(false);
        setLoadingGallery(false);
      }
    });
    return () => unsubscribe();
  }, []);

  const getAuthToken = async () => {
    const currentUser = auth.currentUser;
    if (!currentUser) throw new Error("You must be logged in.");
    return await currentUser.getIdToken();
  };

  const loadNews = async () => {
    try {
      setLoadingNews(true);
      const token = await getAuthToken();
      const response = await fetch("/api/staff/admin/news", { headers: { Authorization: `Bearer ${token}` }, cache: "no-store" });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Failed to load news.");
      setNewsArticles(Array.isArray(data) ? data : data.news || []);
    } catch (error) {
      setErrorMessage(error.message || "Failed to load news.");
    } finally {
      setLoadingNews(false);
    }
  };

  const loadGallery = async () => {
    try {
      setLoadingGallery(true);
      const token = await getAuthToken();
      const response = await fetch("/api/staff/admin/gallery", { headers: { Authorization: `Bearer ${token}` }, cache: "no-store" });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Failed to load gallery.");
      setGalleryImages(Array.isArray(data) ? data : data.gallery || []);
    } catch (error) {
      setErrorMessage(error.message || "Failed to load gallery.");
    } finally {
      setLoadingGallery(false);
    }
  };

  // ============================================================
  // FORM HANDLING
  // ============================================================
  function generateSlug(value) {
    return value.toLowerCase().trim().replace(/[^a-z0-9\s-]/g, "").replace(/\s+/g, "-").replace(/-+/g, "-");
  }

  function handleNewsFormChange(event) {
    const { name, value, type, checked } = event.target;
    setNewsFormError("");
    setNewsForm((prev) => ({ ...prev, [name]: type === "checkbox" ? checked : value }));
  }

  function handleGalleryFormChange(event) {
    const { name, value, type, checked } = event.target;
    setGalleryFormError("");
    setGalleryForm((prev) => {
      const newValue = type === "checkbox" ? checked : value;
      if (name === "photo_type" && value === "general") {
        return { ...prev, photo_type: "general", consent_confirmed: false };
      }
      return { ...prev, [name]: newValue };
    });
  }

  function handleNewsTitleChange(event) {
    const title = event.target.value;
    setNewsFormError("");
    setNewsForm((prev) => ({ ...prev, title, slug: editingNews ? prev.slug : generateSlug(title) }));
  }

  const handleNewsImageChange = (event) => {
    const file = event.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith("image/")) { setNewsFormError("Please select an image."); event.target.value = ""; return; }
    if (file.size > 10 * 1024 * 1024) { setNewsFormError("Image must be < 10MB."); event.target.value = ""; return; }
    setNewsFormError("");
    setNewsImageFile(file);
    setNewsImagePreview(URL.createObjectURL(file));
    setNewsForm((prev) => ({ ...prev, featured_image_url: "", image_contains_learners: false, consent_confirmed: false }));
  };

  const handleGalleryImageChange = (event) => {
    const file = event.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith("image/")) { setGalleryFormError("Please select an image."); event.target.value = ""; return; }
    if (file.size > 10 * 1024 * 1024) { setGalleryFormError("Image must be < 10MB."); event.target.value = ""; return; }
    setGalleryFormError("");
    setGalleryImageFile(file);
    setGalleryImagePreview(URL.createObjectURL(file));
  };

  // ============================================================
  // UPLOADS
  // ============================================================
  const uploadNewsImage = async () => {
    if (!newsImageFile) return newsForm.featured_image_url || "";
    const token = await getAuthToken();
    const formData = new FormData();
    formData.append("file", newsImageFile);
    const res = await fetch("/api/staff/admin/news/upload", { method: "POST", headers: { Authorization: `Bearer ${token}` }, body: formData });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || "Upload failed.");
    return data.file_url;
  };

  const uploadGalleryImage = async () => {
    if (!galleryImageFile) return galleryForm.image_url || "";
    const token = await getAuthToken();
    const formData = new FormData();
    formData.append("file", galleryImageFile);
    const res = await fetch("/api/staff/admin/gallery/upload", { method: "POST", headers: { Authorization: `Bearer ${token}` }, body: formData });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || "Upload failed.");
    return data.image_url || data.file_url;
  };

  // ============================================================
  // SUBMIT LOGIC (DRAFT VS PUBLISH)
  // ============================================================
  const handleCreateArticle = async (e, isPublishing) => {
    e.preventDefault();
    setMessage(""); setErrorMessage(""); setNewsFormError("");

    if (!newsForm.title.trim()) {
      setNewsFormError("Please enter a title.");
      return;
    }

    if (isPublishing) {
      if (!newsForm.slug.trim()) { setNewsFormError("Please enter a slug."); return; }
      if (!newsForm.content.trim()) { setNewsFormError("Please enter the article content."); return; }
      const hasImage = Boolean(newsImageFile) || Boolean(newsForm.featured_image_url);
      if (newsForm.image_contains_learners && !hasImage) { setNewsFormError("Please select an image."); return; }
      if (newsForm.image_contains_learners && !newsForm.consent_confirmed) { setNewsFormError("Consent required to publish learner images."); return; }
    }

    await submitNewsArticle(isPublishing);
  };

  const submitNewsArticle = async (isPublishing) => {
    try {
      setSubmitting(true); setNewsFormError("");
      const imageUrl = await uploadNewsImage();
      const containsLearners = Boolean(imageUrl) && newsForm.image_contains_learners;
      const finalConsent = containsLearners ? newsForm.consent_confirmed : false;

      const token = await getAuthToken();
      const url = editingNews ? `/api/staff/admin/news/${encodeURIComponent(editingNews.slug)}` : "/api/staff/admin/news";

      const response = await fetch(url, {
        method: editingNews ? "PUT" : "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({
          title: newsForm.title, slug: newsForm.slug, category: newsForm.category,
          excerpt: newsForm.excerpt, content: newsForm.content, featured_image_url: imageUrl || null,
          image_contains_learners: containsLearners, consent_confirmed: finalConsent,
          published: isPublishing,
        }),
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Failed to save.");

      setMessage(isPublishing ? "Article published successfully." : "Draft saved successfully.");
      closeNewsForm();
      await loadNews();
    } catch (error) {
      setNewsFormError(error.message || "Failed to save.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleUploadPhoto = async (e, isPublishing) => {
    e.preventDefault();
    setMessage(""); setErrorMessage(""); setGalleryFormError("");

    if (!galleryImageFile && !galleryForm.image_url) {
      setGalleryFormError("Please select an image.");
      return;
    }

    if (isPublishing) {
      if (!galleryForm.alt_text.trim()) { setGalleryFormError("Please enter alt text."); return; }
      if (galleryForm.photo_type === "learners" && !galleryForm.consent_confirmed) { setGalleryFormError("Consent required to publish learner photos."); return; }
    }

    await submitGalleryPhoto(isPublishing);
  };

  const submitGalleryPhoto = async (isPublishing) => {
    try {
      setSubmitting(true); setGalleryFormError("");
      const finalConsent = galleryForm.photo_type === "learners" ? galleryForm.consent_confirmed : false;
      const imageUrl = await uploadGalleryImage();
      if (!imageUrl) throw new Error("Please select an image.");

      const token = await getAuthToken();
      const url = editingGallery ? `/api/staff/admin/gallery/${editingGallery.id}` : "/api/staff/admin/gallery";

      const response = await fetch(url, {
        method: editingGallery ? "PUT" : "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({
          image_url: imageUrl, title: galleryForm.title, caption: galleryForm.caption,
          alt_text: galleryForm.alt_text, category: galleryForm.category,
          photo_type: galleryForm.photo_type, consent_confirmed: finalConsent,
          published: isPublishing,
        }),
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Failed to save.");

      setMessage(isPublishing ? "Photo published successfully." : "Draft saved successfully.");
      closeGalleryForm();
      await loadGallery();
    } catch (error) {
      setGalleryFormError(error.message || "Failed to save.");
    } finally {
      setSubmitting(false);
    }
  };

  // ============================================================
  // OPEN/CLOSE MODALS
  // ============================================================
  const openEditNews = (article) => {
    setMessage(""); setErrorMessage(""); setNewsFormError(""); setEditingNews(article);
    setNewsForm({
      title: article.title || "", slug: article.slug || "", category: article.category || "News",
      excerpt: article.excerpt || "", content: article.content || "", featured_image_url: article.featured_image_url || "",
      image_contains_learners: Boolean(article.image_contains_learners), consent_confirmed: Boolean(article.consent_confirmed), published: Boolean(article.published),
    });
    setNewsImageFile(null); setNewsImagePreview(article.preview_url || ""); setShowNewsForm(true);
  };

  const openNewNewsForm = () => {
    setMessage(""); setErrorMessage(""); setNewsFormError(""); setEditingNews(null);
    setNewsImageFile(null); setNewsImagePreview("");
    setNewsForm({ title: "", slug: "", category: "News", excerpt: "", content: "", featured_image_url: "", image_contains_learners: false, consent_confirmed: false, published: false });
    setShowNewsForm(true);
  };

  const closeNewsForm = () => {
    setShowNewsForm(false); setEditingNews(null); setNewsFormError("");
    setNewsImageFile(null); setNewsImagePreview("");
    setNewsForm({ title: "", slug: "", category: "News", excerpt: "", content: "", featured_image_url: "", image_contains_learners: false, consent_confirmed: false, published: false });
  };

  const openEditGallery = (image) => {
    setMessage(""); setErrorMessage(""); setGalleryFormError(""); setEditingGallery(image);
    setGalleryForm({
      image_url: image.image_url || "", title: image.title || "", caption: image.caption || "",
      alt_text: image.alt_text || "", category: image.category || "School Events",
      photo_type: image.photo_type || "general", consent_confirmed: Boolean(image.consent_confirmed), published: Boolean(image.published),
    });
    setGalleryImageFile(null); setGalleryImagePreview(image.image_url || ""); setShowGalleryForm(true);
  };

  const openNewGalleryForm = () => {
    setMessage(""); setErrorMessage(""); setGalleryFormError(""); setEditingGallery(null);
    setGalleryImageFile(null); setGalleryImagePreview("");
    setGalleryForm({ image_url: "", title: "", caption: "", alt_text: "", category: "School Events", photo_type: "general", consent_confirmed: false, published: false });
    setShowGalleryForm(true);
  };

  const closeGalleryForm = () => {
    setShowGalleryForm(false); setEditingGallery(null); setGalleryFormError("");
    setGalleryImageFile(null); setGalleryImagePreview("");
    setGalleryForm({ image_url: "", title: "", caption: "", alt_text: "", category: "School Events", photo_type: "general", consent_confirmed: false, published: false });
  };

  // ============================================================
  // DELETE ACTIONS
  // ============================================================
  const handleDeleteNews = async (article) => {
    if (!window.confirm(`Delete "${article.title}"?`)) return;
    try {
      setDeletingId(article.id); setMessage(""); setErrorMessage("");
      const token = await getAuthToken();
      const res = await fetch(`/api/staff/admin/news/${encodeURIComponent(article.slug)}`, { method: "DELETE", headers: { Authorization: `Bearer ${token}` } });
      if (!res.ok) throw new Error("Failed to delete.");
      setMessage("Deleted successfully."); await loadNews();
    } catch (err) { setErrorMessage(err.message); } finally { setDeletingId(null); }
  };

  const handleDeleteGallery = async (image) => {
    if (!window.confirm("Delete this photo?")) return;
    try {
      setDeletingId(image.id); setMessage(""); setErrorMessage("");
      const token = await getAuthToken();
      const res = await fetch(`/api/staff/admin/gallery/${image.id}`, { method: "DELETE", headers: { Authorization: `Bearer ${token}` } });
      if (!res.ok) throw new Error("Failed to delete.");
      setMessage("Deleted successfully."); await loadGallery();
    } catch (err) { setErrorMessage(err.message); } finally { setDeletingId(null); }
  };

  const formatDate = (date) => !date ? "—" : new Date(date).toLocaleDateString("en-ZA", { day: "2-digit", month: "short", year: "numeric" });

  const filteredNewsArticles = newsArticles.filter((a) => newsFilter === "published" ? a.published : newsFilter === "draft" ? !a.published : true);
  const filteredGalleryImages = galleryImages.filter((i) => galleryFilter === "published" ? i.published : galleryFilter === "draft" ? !i.published : true);

  const activeMediaItems = activeSection === "news" ? newsArticles : galleryImages;
  const totalMediaItems = activeMediaItems.length;
  const publishedMediaItems = activeMediaItems.filter((i) => i.published).length;
  const draftMediaItems = activeMediaItems.filter((i) => !i.published).length;

  return (
    <ShellPage
      sidebar={(props) => <StaffSidebar {...props} />}
      modals={<>
        {/* NEWS MODAL */}
        {showNewsForm && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4 py-6 backdrop-blur-sm">
            <div className="max-h-[92vh] w-full max-w-2xl overflow-hidden rounded-2xl bg-white shadow-2xl">
              <div className="flex items-center justify-between border-b border-gray-200 px-6 py-5">
                <div>
                  <h2 className="text-xl font-bold text-[#0d2260]">{editingNews ? "Edit Article" : "Create Article"}</h2>
                  <p className="mt-1 text-sm text-[#5a6a82]">{editingNews ? "Update the article details." : "Create a news article or school announcement."}</p>
                </div>
                <button type="button" onClick={closeNewsForm} className="rounded-lg p-2 text-gray-500 hover:bg-gray-100"><X className="h-5 w-5" /></button>
              </div>

              <form onSubmit={(e) => handleCreateArticle(e, true)} noValidate className="max-h-[calc(92vh-90px)] space-y-5 overflow-y-auto px-6 py-6">
                <div>
                  <label className="mb-2 block text-sm font-semibold text-[#0d2260]">Title <span className="text-red-500">*</span></label>
                  <input type="text" name="title" value={newsForm.title} onChange={handleNewsTitleChange} placeholder="Article title" className="w-full rounded-lg border border-gray-300 px-4 py-3 text-sm outline-none focus:border-[#0d2260]" />
                </div>
                <div>
                  <label className="mb-2 block text-sm font-semibold text-[#0d2260]">Slug {editingNews && <span className="text-red-500">*</span>}</label>
                  <input type="text" name="slug" value={newsForm.slug} onChange={handleNewsFormChange} placeholder="url-slug" className="w-full rounded-lg border border-gray-300 px-4 py-3 text-sm outline-none focus:border-[#0d2260]" />
                </div>
                <div>
                  <label className="mb-2 block text-sm font-semibold text-[#0d2260]">Category</label>
                  <select name="category" value={newsForm.category} onChange={handleNewsFormChange} className="w-full rounded-lg border border-gray-300 bg-white px-4 py-3 text-sm outline-none focus:border-[#0d2260]">
                    <option value="News">News</option><option value="Announcements">Announcements</option><option value="Events">Events</option>
                  </select>
                </div>
                <div>
                  <label className="mb-2 block text-sm font-semibold text-[#0d2260]">Excerpt <span className="text-gray-400 font-normal">(Optional)</span></label>
                  <textarea name="excerpt" value={newsForm.excerpt} onChange={handleNewsFormChange} rows={2} className="w-full rounded-lg border border-gray-300 px-4 py-3 text-sm outline-none focus:border-[#0d2260]" />
                </div>
                <div>
                  <label className="mb-2 block text-sm font-semibold text-[#0d2260]">Content {!editingNews && <span className="text-red-500">*</span>}</label>
                  <textarea name="content" value={newsForm.content} onChange={handleNewsFormChange} rows={6} className="w-full rounded-lg border border-gray-300 px-4 py-3 text-sm outline-none focus:border-[#0d2260]" />
                </div>
                <div>
                  <label className="mb-2 block text-sm font-semibold text-[#0d2260]">Featured Image</label>
                  <div className="rounded-xl border-2 border-dashed border-gray-300 bg-gray-50 p-5">
                    {newsImagePreview ? (
                      <div className="space-y-4">
                        <img src={newsImagePreview} alt="Preview" className="max-h-64 w-full object-contain rounded-lg" />
                        <label className="flex cursor-pointer items-center justify-center gap-2 rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-semibold text-gray-700 hover:bg-gray-50"><Upload className="h-4 w-4" /> Change Image<input type="file" accept="image/*" onChange={handleNewsImageChange} className="hidden" /></label>
                      </div>
                    ) : (
                      <label className="flex cursor-pointer flex-col items-center justify-center py-4"><ImageIcon className="h-8 w-8 text-[#0d2260] mb-2" /><span className="text-sm font-semibold text-[#0d2260]">Choose Image</span><input type="file" accept="image/*" onChange={handleNewsImageChange} className="hidden" /></label>
                    )}
                  </div>
                </div>

                {(newsImagePreview || newsForm.featured_image_url) && (
                  <div>
                    <label className="mb-2 block text-sm font-semibold text-[#0d2260]">Does this image contain learners?</label>
                    <select value={newsForm.image_contains_learners ? "yes" : "no"} onChange={(e) => { const c = e.target.value === "yes"; setNewsForm(p => ({ ...p, image_contains_learners: c, consent_confirmed: c ? p.consent_confirmed : false })); setNewsFormError(""); }} className="w-full rounded-lg border border-gray-300 bg-white px-4 py-3 text-sm outline-none focus:border-[#0d2260]">
                      <option value="no">No</option><option value="yes">Yes — Learners are visible</option>
                    </select>

                    {newsForm.image_contains_learners && (
                      <div className={`mt-3 rounded-lg border p-4 transition-colors ${newsForm.consent_confirmed ? 'border-green-200 bg-green-50' : 'border-amber-200 bg-amber-50'}`}>
                        <label className="flex cursor-pointer items-start gap-3">
                          <input type="checkbox" checked={newsForm.consent_confirmed} onChange={(e) => { setNewsForm(p => ({ ...p, consent_confirmed: e.target.checked })); setNewsFormError(""); }} className="mt-1 h-4 w-4 accent-[#0d2260]" />
                          <div>
                            <p className={`text-sm font-semibold ${newsForm.consent_confirmed ? 'text-green-800' : 'text-amber-800'}`}>{newsForm.consent_confirmed ? "Consent confirmed" : "Consent required"}</p>
                            <p className={`mt-1 text-xs leading-5 ${newsForm.consent_confirmed ? 'text-green-700' : 'text-amber-700'}`}>I confirm that parent/guardian consent has been obtained for the learners shown.</p>
                          </div>
                        </label>
                      </div>
                    )}
                  </div>
                )}

                {newsFormError && <div className="flex items-start gap-3 rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700"><AlertTriangle className="mt-0.5 h-5 w-5 shrink-0" /><p>{newsFormError}</p></div>}

                <div className="flex flex-col sm:flex-row justify-end gap-3 border-t border-gray-200 pt-5">
                  <button type="button" onClick={closeNewsForm} disabled={submitting} className="rounded-lg border border-gray-300 px-5 py-2.5 text-sm font-semibold text-gray-700 hover:bg-gray-50 disabled:opacity-50">Cancel</button>
                  <button type="button" onClick={(e) => handleCreateArticle(e, false)} disabled={submitting} className="rounded-lg bg-[#0d2260] px-5 py-2.5 text-sm font-semibold text-white hover:bg-[#0d2260]/90 disabled:opacity-50">{submitting ? "Saving..." : "Save as Draft"}</button>
                  <button type="submit" disabled={submitting} className="rounded-lg bg-[#c9a227] px-5 py-2.5 text-sm font-semibold text-[#0d2260] hover:bg-[#c9a227]/90 disabled:opacity-50">{submitting ? "Publishing..." : "Publish"}</button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* GALLERY MODAL */}
        {showGalleryForm && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4 py-6 backdrop-blur-sm">
            <div className="max-h-[92vh] w-full max-w-2xl overflow-hidden rounded-2xl bg-white shadow-2xl">
              <div className="flex items-center justify-between border-b border-gray-200 px-6 py-5">
                <div>
                  <h2 className="text-xl font-bold text-[#0d2260]">{editingGallery ? "Edit Photo" : "Upload Photo"}</h2>
                  <p className="mt-1 text-sm text-[#5a6a82]">{editingGallery ? "Update details." : "Upload a photo to the gallery."}</p>
                </div>
                <button type="button" onClick={closeGalleryForm} className="rounded-lg p-2 text-gray-500 hover:bg-gray-100"><X className="h-5 w-5" /></button>
              </div>

              <form onSubmit={(e) => handleUploadPhoto(e, true)} noValidate className="max-h-[calc(92vh-90px)] space-y-5 overflow-y-auto px-6 py-6">
                <div>
                  <label className="mb-2 block text-sm font-semibold text-[#0d2260]">Image <span className="text-red-500">*</span></label>
                  <div className="rounded-xl border-2 border-dashed border-gray-300 bg-gray-50 p-5">
                    {galleryImagePreview ? (
                      <div className="space-y-4">
                        <img src={galleryImagePreview} alt="Preview" className="max-h-64 w-full object-contain rounded-lg" />
                        <label className="flex cursor-pointer items-center justify-center gap-2 rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-semibold text-gray-700 hover:bg-gray-50"><Upload className="h-4 w-4" /> Change Image<input type="file" accept="image/*" onChange={handleGalleryImageChange} className="hidden" /></label>
                      </div>
                    ) : (
                      <label className="flex cursor-pointer flex-col items-center justify-center py-4"><ImageIcon className="h-8 w-8 text-[#0d2260] mb-2" /><span className="text-sm font-semibold text-[#0d2260]">Choose Image</span><input type="file" accept="image/*" onChange={handleGalleryImageChange} className="hidden" /></label>
                    )}
                  </div>
                </div>

                <div>
                  <label className="mb-2 block text-sm font-semibold text-[#0d2260]">Title <span className="text-gray-400 font-normal">(Optional)</span></label>
                  <input type="text" name="title" value={galleryForm.title} onChange={handleGalleryFormChange} className="w-full rounded-lg border border-gray-300 px-4 py-3 text-sm outline-none focus:border-[#0d2260]" />
                </div>
                <div>
                  <label className="mb-2 block text-sm font-semibold text-[#0d2260]">Caption <span className="text-gray-400 font-normal">(Optional)</span></label>
                  <textarea name="caption" value={galleryForm.caption} onChange={handleGalleryFormChange} rows={2} className="w-full rounded-lg border border-gray-300 px-4 py-3 text-sm outline-none focus:border-[#0d2260]" />
                </div>
                <div>
                  <label className="mb-2 block text-sm font-semibold text-[#0d2260]">Alt Text {!editingGallery && <span className="text-red-500">*</span>}</label>
                  <input type="text" name="alt_text" value={galleryForm.alt_text} onChange={handleGalleryFormChange} className="w-full rounded-lg border border-gray-300 px-4 py-3 text-sm outline-none focus:border-[#0d2260]" />
                </div>
                <div>
                  <label className="mb-2 block text-sm font-semibold text-[#0d2260]">Category</label>
                  <select name="category" value={galleryForm.category} onChange={handleGalleryFormChange} className="w-full rounded-lg border border-gray-300 bg-white px-4 py-3 text-sm outline-none focus:border-[#0d2260]">
                    <option value="School Events">School Events</option><option value="Sports">Sports</option><option value="Academics">Academics</option><option value="Islamic Activities">Islamic Activities</option>
                  </select>
                </div>
                <div>
                  <label className="mb-2 block text-sm font-semibold text-[#0d2260]">Photo Type</label>
                  <select name="photo_type" value={galleryForm.photo_type} onChange={handleGalleryFormChange} className="w-full rounded-lg border border-gray-300 bg-white px-4 py-3 text-sm outline-none focus:border-[#0d2260]">
                    <option value="general">General — No learners visible</option><option value="learners">Learners — Learners are visible</option>
                  </select>
                </div>

                {galleryForm.photo_type === "learners" && (
                  <div className={`mt-3 rounded-lg border p-4 transition-colors ${galleryForm.consent_confirmed ? 'border-green-200 bg-green-50' : 'border-amber-200 bg-amber-50'}`}>
                    <label className="flex cursor-pointer items-start gap-3">
                      <input type="checkbox" checked={galleryForm.consent_confirmed} onChange={(e) => { setGalleryForm(p => ({ ...p, consent_confirmed: e.target.checked })); setGalleryFormError(""); }} className="mt-1 h-4 w-4 accent-[#0d2260]" />
                      <div>
                        <p className={`text-sm font-semibold ${galleryForm.consent_confirmed ? 'text-green-800' : 'text-amber-800'}`}>{galleryForm.consent_confirmed ? "Consent confirmed" : "Consent required"}</p>
                        <p className={`mt-1 text-xs leading-5 ${galleryForm.consent_confirmed ? 'text-green-700' : 'text-amber-700'}`}>I confirm that parent/guardian consent has been obtained for the learners shown.</p>
                      </div>
                    </label>
                  </div>
                )}

                {galleryFormError && <div className="flex items-start gap-3 rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700"><AlertTriangle className="mt-0.5 h-5 w-5 shrink-0" /><p>{galleryFormError}</p></div>}

                <div className="flex flex-col sm:flex-row justify-end gap-3 border-t border-gray-200 pt-5">
                  <button type="button" onClick={closeGalleryForm} disabled={submitting} className="rounded-lg border border-gray-300 px-5 py-2.5 text-sm font-semibold text-gray-700 hover:bg-gray-50 disabled:opacity-50">Cancel</button>
                  <button type="button" onClick={(e) => handleUploadPhoto(e, false)} disabled={submitting} className="rounded-lg bg-[#0d2260] px-5 py-2.5 text-sm font-semibold text-white hover:bg-[#0d2260]/90 disabled:opacity-50">{submitting ? "Saving..." : "Save as Draft"}</button>
                  <button type="submit" disabled={submitting} className="rounded-lg bg-[#c9a227] px-5 py-2.5 text-sm font-semibold text-[#0d2260] hover:bg-[#c9a227]/90 disabled:opacity-50">{submitting ? "Publishing..." : "Publish"}</button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* VIEW MODAL */}
        {showViewModal && viewItem && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4 py-6 backdrop-blur-sm">
             <div className="max-h-[92vh] w-full max-w-3xl overflow-hidden rounded-2xl bg-white shadow-2xl">
                <div className="flex items-center justify-between border-b border-gray-200 px-6 py-5">
                    <h2 className="text-xl font-bold text-[#0d2260]">View {viewType === "news" ? "Article" : "Photo"}</h2>
                    <button type="button" onClick={() => { setShowViewModal(false); setViewItem(null); setViewType(null); }} className="rounded-lg p-2 text-gray-500 hover:bg-gray-100"><X className="h-5 w-5" /></button>
                </div>
                <div className="max-h-[calc(92vh-90px)] overflow-y-auto p-6">
                  {viewType === "news" ? (
                     <div className="space-y-6"><h3 className="text-2xl font-bold text-[#0d2260]">{viewItem.title}</h3><div className="whitespace-pre-wrap rounded-xl bg-gray-50 p-5 text-sm text-gray-700">{viewItem.content}</div>{viewItem.preview_url && <img src={viewItem.preview_url} alt="Preview" className="max-h-96 w-full object-contain" />}</div>
                  ) : (
                     <div className="space-y-6"><img src={viewItem.preview_url} alt="Preview" className="max-h-[500px] w-full object-contain" /><h3 className="text-xl font-bold text-[#0d2260]">{viewItem.title || "Untitled"}</h3><p className="text-sm text-gray-600">{viewItem.caption}</p></div>
                  )}
                </div>
             </div>
          </div>
        )}
      </>}
      spaceY=""
    >
        <PageHeader icon={ImageIcon} portalLabel="Admin Portal" title="Media Management" subtitle="Manage the news, announcements and gallery content." />
        {message && <div className="mb-5 flex items-start gap-3 rounded-xl border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-700"><CheckCircle className="mt-0.5 h-5 w-5 shrink-0" /><p>{message}</p></div>}
        {errorMessage && <div className="mb-5 flex items-start gap-3 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700"><AlertTriangle className="mt-0.5 h-5 w-5 shrink-0" /><p>{errorMessage}</p></div>}

        <div className="mb-5 grid gap-3 md:grid-cols-2">
          <button type="button" onClick={() => setActiveSection("news")} className={`group rounded-xl border p-4 text-left shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md ${activeSection === "news" ? "border-[#0d2260] bg-[#0d2260]" : "border-gray-200 bg-white hover:border-[#c9a227]"}`}>
            <div className="flex items-center justify-between"><div className={`flex h-9 w-9 items-center justify-center rounded-lg ${activeSection === "news" ? "bg-[#c9a227]/20 text-[#c9a227]" : "bg-[#0d2260] text-[#c9a227]"}`}><Newspaper className="h-4 w-4" /></div><ArrowRight className={`h-4 w-4 transition-transform group-hover:translate-x-1 ${activeSection === "news" ? "text-[#c9a227]" : "text-gray-300"}`} /></div>
            <h2 className={`mt-3 text-sm font-bold ${activeSection === "news" ? "text-white" : "text-[#0d2260]"}`}>News & Announcements</h2>
            <p className={`mt-1 line-clamp-2 text-xs leading-5 ${activeSection === "news" ? "text-blue-100" : "text-[#5a6a82]"}`}>Create and manage school news and announcements.</p>
          </button>
          <button type="button" onClick={() => setActiveSection("gallery")} className={`group rounded-xl border p-4 text-left shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md ${activeSection === "gallery" ? "border-[#0d2260] bg-[#0d2260]" : "border-gray-200 bg-white hover:border-[#c9a227]"}`}>
            <div className="flex items-center justify-between"><div className={`flex h-9 w-9 items-center justify-center rounded-lg ${activeSection === "gallery" ? "bg-[#c9a227]/20 text-[#c9a227]" : "bg-[#0d2260] text-[#c9a227]"}`}><Images className="h-4 w-4" /></div><ArrowRight className={`h-4 w-4 transition-transform group-hover:translate-x-1 ${activeSection === "gallery" ? "text-[#c9a227]" : "text-gray-300"}`} /></div>
            <h2 className={`mt-3 text-sm font-bold ${activeSection === "gallery" ? "text-white" : "text-[#0d2260]"}`}>Gallery</h2>
            <p className={`mt-1 line-clamp-2 text-xs leading-5 ${activeSection === "gallery" ? "text-blue-100" : "text-[#5a6a82]"}`}>Upload and manage school photographs.</p>
          </button>
        </div>

        <div className="mb-5 grid grid-cols-1 gap-3 sm:grid-cols-3">
          <div className="rounded-xl border border-gray-200 bg-white px-4 py-4 shadow-sm"><div className="flex items-center justify-between"><div><p className="text-xs font-medium text-[#5a6a82]">Total</p><p className="mt-1 text-2xl font-bold text-[#0d2260]">{totalMediaItems}</p></div><div className="flex h-9 w-9 items-center justify-center rounded-lg bg-[#0d2260]/10 text-[#0d2260]">{activeSection === "news" ? <Newspaper className="h-4 w-4" /> : <Images className="h-4 w-4" />}</div></div></div>
          <div className="rounded-xl border border-gray-200 bg-white px-4 py-4 shadow-sm"><div className="flex items-center justify-between"><div><p className="text-xs font-medium text-[#5a6a82]">Published</p><p className="mt-1 text-2xl font-bold text-green-700">{publishedMediaItems}</p></div><div className="flex h-9 w-9 items-center justify-center rounded-lg bg-green-50 text-green-700"><CheckCircle className="h-4 w-4" /></div></div></div>
          <div className="rounded-xl border border-gray-200 bg-white px-4 py-4 shadow-sm"><div className="flex items-center justify-between"><div><p className="text-xs font-medium text-[#5a6a82]">Draft</p><p className="mt-1 text-2xl font-bold text-amber-700">{draftMediaItems}</p></div><div className="flex h-9 w-9 items-center justify-center rounded-lg bg-amber-50 text-amber-700"><Pencil className="h-4 w-4" /></div></div></div>
        </div>

        {activeSection === "news" && (
          <section className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm">
            <div className="flex flex-col gap-3 border-b border-gray-100 px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
              <h2 className="text-base font-bold text-[#0d2260]">News & Announcements</h2>
              <div className="flex flex-wrap items-center gap-2">
                <select value={newsFilter} onChange={(e) => setNewsFilter(e.target.value)} className="rounded-lg border border-gray-300 bg-white px-3 py-2 text-xs text-gray-700 outline-none focus:border-[#0d2260]"><option value="all">All</option><option value="published">Published</option><option value="draft">Drafts</option></select>
                <button onClick={openNewNewsForm} className="inline-flex items-center gap-2 rounded-lg bg-[#0d2260] px-3.5 py-2 text-xs font-semibold text-white transition hover:bg-[#0d2260]/90"><Plus className="h-3.5 w-3.5" /> Create Article</button>
              </div>
            </div>
            {loadingNews ? <div className="px-5 py-12 text-center"><LoadingState label="Loading articles..." /></div> : filteredNewsArticles.length === 0 ? <div className="px-5 py-12 text-center text-sm text-[#5a6a82]">No news articles found.</div> : (
              <div className="divide-y divide-gray-100">
                {filteredNewsArticles.map((article) => (
                  <div key={article.id} className="px-5 py-4 transition hover:bg-gray-50/70">
                     <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                        <div className="min-w-0 flex-1">
                           <div className="flex flex-wrap items-center gap-1.5">
                              <h3 className="text-sm font-semibold text-[#0d2260]">{article.title}</h3>
                              <span className="rounded-full bg-gray-100 px-2 py-0.5 text-[11px] font-medium text-gray-600">{article.category}</span>
                              <span className={`rounded-full px-2 py-0.5 text-[11px] font-medium ${article.published ? "bg-green-100 text-green-700" : "bg-yellow-100 text-yellow-700"}`}>{article.published ? "Published" : "Draft"}</span>
                           </div>
                           <p className="mt-1.5 line-clamp-2 max-w-3xl text-xs leading-5 text-[#5a6a82]">{article.excerpt || article.content}</p>
                        </div>
                        <div className="flex shrink-0 flex-wrap gap-1.5">
                           <button onClick={() => openViewNews(article)} className="inline-flex items-center gap-1.5 rounded-lg border border-gray-200 bg-white px-2.5 py-1.5 text-xs font-medium text-gray-700 transition hover:bg-gray-50"><Eye className="h-3.5 w-3.5" /> View</button>
                           <button onClick={() => openEditNews(article)} className="inline-flex items-center gap-1.5 rounded-lg border border-gray-200 bg-white px-2.5 py-1.5 text-xs font-medium text-gray-700 transition hover:bg-gray-50"><Pencil className="h-3.5 w-3.5" /> Edit</button>
                           <button onClick={() => handleDeleteNews(article)} className="inline-flex items-center gap-1.5 rounded-lg border border-red-200 bg-white px-2.5 py-1.5 text-xs font-medium text-red-600 transition hover:bg-red-50"><Trash2 className="h-3.5 w-3.5" /> Delete</button>
                        </div>
                     </div>
                  </div>
                ))}
              </div>
            )}
          </section>
        )}

        {activeSection === "gallery" && (
          <section className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm">
            <div className="flex flex-col gap-3 border-b border-gray-100 px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
              <h2 className="text-base font-bold text-[#0d2260]">Gallery</h2>
              <div className="flex flex-wrap items-center gap-2">
                <select value={galleryFilter} onChange={(e) => setGalleryFilter(e.target.value)} className="rounded-lg border border-gray-300 bg-white px-3 py-2 text-xs text-gray-700 outline-none focus:border-[#0d2260]"><option value="all">All</option><option value="published">Published</option><option value="draft">Drafts</option></select>
                <button onClick={openNewGalleryForm} className="inline-flex items-center gap-2 rounded-lg bg-[#0d2260] px-3.5 py-2 text-xs font-semibold text-white transition hover:bg-[#162f7a]"><Plus className="h-3.5 w-3.5" /> Add Photo</button>
              </div>
            </div>
            {loadingGallery ? <div className="px-5 py-12 text-center"><LoadingState label="Loading gallery..." /></div> : filteredGalleryImages.length === 0 ? <div className="px-5 py-12 text-center text-sm text-[#5a6a82]">No photos found.</div> : (
              <div className="divide-y divide-gray-100">
                {filteredGalleryImages.map((image) => (
                  <div key={image.id} className="px-5 py-4 transition hover:bg-gray-50/70">
                     <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                        <div className="flex min-w-0 flex-1 gap-3">
                           <div className="h-16 w-24 shrink-0 overflow-hidden rounded-lg bg-gray-100">
                              {image.preview_url ? <img src={image.preview_url} alt="Preview" className="h-full w-full object-cover" /> : <div className="flex h-full items-center justify-center"><ImageIcon className="h-5 w-5 text-gray-400" /></div>}
                           </div>
                           <div className="min-w-0 flex-1">
                              <div className="flex flex-wrap items-center gap-1.5">
                                 <h3 className="text-sm font-semibold text-[#0d2260]">{image.title || "Untitled photo"}</h3>
                                 <span className={`rounded-full px-2 py-0.5 text-[11px] font-medium ${image.published ? "bg-green-100 text-green-700" : "bg-yellow-100 text-yellow-700"}`}>{image.published ? "Published" : "Draft"}</span>
                              </div>
                              {image.caption && <p className="mt-1.5 line-clamp-2 text-xs leading-5 text-[#5a6a82]">{image.caption}</p>}
                           </div>
                        </div>
                        <div className="flex shrink-0 flex-wrap gap-1.5">
                           <button onClick={() => { setViewItem(image); setViewType("gallery"); setShowViewModal(true); }} className="inline-flex items-center gap-1.5 rounded-lg border border-gray-200 bg-white px-2.5 py-1.5 text-xs font-medium text-gray-700 transition hover:bg-gray-50"><Eye className="h-3.5 w-3.5" /> View</button>
                           <button onClick={() => openEditGallery(image)} className="inline-flex items-center gap-1.5 rounded-lg border border-gray-200 bg-white px-2.5 py-1.5 text-xs font-medium text-gray-700 transition hover:bg-gray-50"><Pencil className="h-3.5 w-3.5" /> Edit</button>
                           <button onClick={() => handleDeleteGallery(image)} className="inline-flex items-center gap-1.5 rounded-lg border border-red-200 bg-white px-2.5 py-1.5 text-xs font-medium text-red-600 transition hover:bg-red-50"><Trash2 className="h-3.5 w-3.5" /> Delete</button>
                        </div>
                     </div>
                  </div>
                ))}
              </div>
            )}
          </section>
        )}
    </ShellPage>
  );
}