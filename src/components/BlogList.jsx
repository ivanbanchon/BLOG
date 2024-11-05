// src/components/BlogList.jsx
import React, { useState, useEffect } from 'react';
import { Filter, Loader, Search, X } from 'lucide-react';
import BlogEntry from './BlogEntry';
import { Alert } from './Alert';
import { BaseInteractionManager } from '../utils/BaseInteractionManager';
class BlogListManager extends BaseInteractionManager {
constructor(posts = []) {
super();
this.posts = posts;
}
filterByCategory(posts, category) {
try {
if (!category || category === 'all') return posts;
return posts.filter(post =>
post.category.toLowerCase() === category.toLowerCase()
);
} catch (error) {
this.handleError(error, 'filtrado por categoría');
return posts;
}
}
searchPosts(posts, searchTerm) {
try {
if (!searchTerm?.trim()) return posts;
const term = searchTerm.toLowerCase().trim();
const filteredPosts = posts.filter(post => {
// Asegurarse de que todos los campos existan antes de buscar
const title = (post.title || '').toLowerCase();
const category = (post.category || '').toLowerCase();
const content = (post.content || '').toLowerCase();
const date = new Date(post.createdAt);
const formattedDate = date.toLocaleDateString('es-ES', {
day: '2-digit',
month: '2-digit',
year: 'numeric'
}).toLowerCase();
// Comprobar coincidencias exactas en categoría
if (category === term) return true;
// Comprobar coincidencias parciales en otros campos
const titleMatch = title.includes(term);
const contentMatch = content.includes(term);
const dateMatch = formattedDate.includes(term);
return titleMatch || contentMatch || dateMatch;
});
console.log(`Búsqueda: "${term}" - Resultados:`, filteredPosts.length);
return filteredPosts;
} catch (error) {
console.error('Error en la búsqueda:', error);
return posts;
}
}
sortPosts(posts, sortBy) {
try {
const sortedPosts = [...posts];
switch (sortBy) {
case 'oldest':
return sortedPosts.sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));
case 'mostCommented':
return sortedPosts.sort((a, b) => (b.comments?.length || 0) - (a.comments?.length || 0));
case 'mostReacted':
return sortedPosts.sort((a, b) => {
const reactionsA = Object.values(a.reactions || {}).reduce((sum, val) => sum + val, 0);
const reactionsB = Object.values(b.reactions || {}).reduce((sum, val) => sum + val, 0);
return reactionsB - reactionsA;
});
default: // newest
return sortedPosts.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
}
} catch (error) {
this.handleError(error, 'ordenamiento de posts');
return posts;
}
}
}
const BlogList = ({ posts, selectedCategory, onDelete, onUpdate }) => {
const [filteredPosts, setFilteredPosts] = useState([]);
const [sortBy, setSortBy] = useState('newest');
const [loading, setLoading] = useState(false);
const [error, setError] = useState(null);
const [searchTerm, setSearchTerm] = useState('');
const [currentPage, setCurrentPage] = useState(1);
const [postsPerPage] = useState(6);
const sortOptions = [
{ value: 'newest', label: 'Más recientes' },
{ value: 'oldest', label: 'Más antiguos' },
{ value: 'mostCommented', label: 'Más comentados' },
{ value: 'mostReacted', label: 'Más populares' }
];
useEffect(() => {
try {
setLoading(true);
const blogManager = new BlogListManager(posts);
let processedPosts = [...posts];
if (searchTerm.trim()) {
// Si hay un término de búsqueda, aplicar la búsqueda primero
processedPosts = blogManager.searchPosts(processedPosts, searchTerm);
} else if (selectedCategory && selectedCategory !== 'all') {
// Si no hay búsqueda pero hay categoría seleccionada, aplicar filtro de categoría
processedPosts = blogManager.filterByCategory(processedPosts, selectedCategory);
}
// Aplicar ordenamiento al final
processedPosts = blogManager.sortPosts(processedPosts, sortBy);
setFilteredPosts(processedPosts);
setCurrentPage(1); // Resetear a la primera página cuando cambian los filtros
console.log({
searchTerm,
selectedCategory,
resultsCount: processedPosts.length
});
} catch (error) {
console.error('Error al procesar posts:', error);
setError('Error al procesar los posts');
} finally {
setLoading(false);
}
}, [posts, selectedCategory, sortBy, searchTerm]);
// Calcular posts para la página actual
const indexOfLastPost = currentPage * postsPerPage;
const indexOfFirstPost = indexOfLastPost - postsPerPage;
const currentPosts = filteredPosts.slice(indexOfFirstPost, indexOfLastPost);
const totalPages = Math.ceil(filteredPosts.length / postsPerPage);
// Cambiar de página
const paginate = (pageNumber) => {
setCurrentPage(pageNumber);
window.scrollTo({ top: 0, behavior: 'smooth' });
};
return (
<div className="space-y-6">
{error && (
<Alert type="error" onClose={() => setError(null)}>
{error}
</Alert>
)}
{/* Filtros y búsqueda */}
<div className="bg-white rounded-lg shadow p-4">
<div className="flex flex-wrap items-center justify-between gap-4">
{/* Barra de búsqueda */}
<div className="flex-1 max-w-md">
<div className="relative">
<input
type="text"
value={searchTerm}
onChange={(e) => {
const value = e.target.value;
setSearchTerm(value);
console.log('Buscando:', value); // Para debugging
}}
placeholder="Buscar por título, categoría o fecha (dd/mm/yyyy)..."
className="w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary"
/>
<Search className="absolute left-3 top-2.5 text-gray-400 w-5 h-5" />
{searchTerm && (
<button
onClick={() => {
setSearchTerm('');
console.log('Limpiando búsqueda'); // Para debugging
}}
className="absolute right-3 top-2.5 text-gray-400 hover:text-gray-600"
>
<X className="w-5 h-5" />
</button>
)}
</div>
{searchTerm && (
<p className="mt-1 text-sm text-gray-500">
{filteredPosts.length === 0
? 'No se encontraron resultados para tu búsqueda'
: `Se ${filteredPosts.length === 1 ? 'encontró' : 'encontraron'} ${filteredPosts.length}
${filteredPosts.length === 1 ? 'resultado' : 'resultados'}`}
</p>
)}
</div>
{/* Ordenamiento */}
<div className="flex items-center space-x-4">
<div className="flex items-center space-x-2">
<Filter className="w-5 h-5 text-gray-500" />
<select
value={sortBy}
onChange={(e) => setSortBy(e.target.value)}
className="border-0 bg-transparent focus:ring-2 focus:ring-primary rounded-lg cursor-pointer textgray-700"
>
{sortOptions.map(option => (
<option key={option.value} value={option.value}>
{option.label}
</option>
))}
</select>
</div>
<span className="text-sm text-gray-500">
Total: {filteredPosts.length} {filteredPosts.length === 1 ? 'post' : 'posts'}
</span>
</div>
</div>
</div>
{/* Lista de posts */}
{loading ? (
<div className="flex justify-center items-center h-64">
<Loader className="w-8 h-8 animate-spin text-primary" />
</div>
) : currentPosts.length === 0 ? (
<div className="text-center py-12 bg-white rounded-lg shadow">
<p className="text-gray-500">
{searchTerm
? 'No se encontraron posts que coincidan con tu búsqueda'
: selectedCategory !== 'all'
? 'No hay posts disponibles en esta categoría'
: 'No hay posts disponibles'}
</p>
</div>
) : (
<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
{currentPosts.map(post => (
<BlogEntry
key={post.id}
post={post}
onDelete={onDelete}
onUpdate={onUpdate}
/>
))}
</div>
)}
{/* Paginación */}
{totalPages > 1 && (
<div className="flex justify-center items-center space-x-4 mt-8">
<button
onClick={() => paginate(currentPage - 1)}
disabled={currentPage === 1}
className="px-4 py-2 bg-white rounded-lg shadow hover:bg-gray-50 disabled:opacity-50 transitioncolors"
>
Anterior
</button>
<div className="flex items-center space-x-2">
{Array.from({ length: totalPages }, (_, i) => i + 1).map(number => (
<button
key={number}
onClick={() => paginate(number)}
className={`w-8 h-8 rounded-full transition-colors ${
currentPage === number
? 'bg-primary text-white'
: 'bg-white hover:bg-gray-50'
}`}
>
{number}
</button>
))}
</div>
<button
onClick={() => paginate(currentPage + 1)}
disabled={currentPage === totalPages}
className="px-4 py-2 bg-white rounded-lg shadow hover:bg-gray-50 disabled:opacity-50 transitioncolors"
>
Siguiente
</button>
</div>
)}
</div>
);
};
export default BlogList;