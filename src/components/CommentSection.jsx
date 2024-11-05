// src/components/CommentSection.jsx
import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Edit, Trash2, MessageCircle, Clock, ChevronDown, ChevronUp, User } from 'lucide-react';
import { Alert } from './Alert';
import ConfirmDialog from './ConfirmDialog';
class CommentManager {
constructor(comments = []) {
this.comments = comments;
}
validateComment(content) {
if (!content?.trim()) {
throw new Error('El comentario no puede estar vacío');
}
if (content.trim().length < 3) {
throw new Error('El comentario debe tener al menos 3 caracteres');
}
if (content.length > 500) {
throw new Error('El comentario no puede exceder los 500 caracteres');
}
return true;
}
addComment(comment) {
this.validateComment(comment.content);
return [{
...comment,
id: Date.now(),
createdAt: new Date().toISOString(),
likes: 0,
replies: []
}, ...this.comments];
}
updateComment(commentId, newContent) {
this.validateComment(newContent);
return this.comments.map(comment => {
if (comment.id === commentId) {
return {
...comment,
content: newContent,
updatedAt: new Date().toISOString()
};
}
return comment;
});
}
deleteComment(commentId) {
return this.comments.filter(comment => comment.id !== commentId);
}
addReply(commentId, reply) {
this.validateComment(reply.content);
return this.comments.map(comment => {
if (comment.id === commentId) {
return {
...comment,
replies: [{
...reply,
id: Date.now(),
createdAt: new Date().toISOString(),
likes: 0
}, ...comment.replies]
};
}
return comment;
});
}
}
const CommentSection = ({ post, onUpdatePost }) => {
const [newComment, setNewComment] = useState('');
const [newReply, setNewReply] = useState('');
const [editingId, setEditingId] = useState(null);
const [replyingTo, setReplyingTo] = useState(null);
const [loading, setLoading] = useState(false);
const [error, setError] = useState(null);
const [expandedComments, setExpandedComments] = useState(new Set());
const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
const [showCancelConfirm, setShowCancelConfirm] = useState(false);
const [commentToDelete, setCommentToDelete] = useState(null);
const commentInputRef = useRef(null);
const editInputRef = useRef(null);
const navigate = useNavigate();
const commentManager = new CommentManager(post.comments);
useEffect(() => {
if (editingId && editInputRef.current) {
editInputRef.current.focus();
}
}, [editingId]);
const formatDate = (date) => {
const options = { year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' };
return new Date(date).toLocaleDateString('es-ES', options);
};
const handleAddComment = async (e) => {
e.preventDefault();
try {
setLoading(true);
const updatedComments = commentManager.addComment({
content: newComment,
author: 'Usuario Actual'
});
await onUpdatePost({ ...post, comments: updatedComments });
setNewComment('');
setError(null);
} catch (error) {
setError(error.message);
} finally {
setLoading(false);
}
};
const handleCancelComment = () => {
if (newComment.trim()) {
setShowCancelConfirm(true);
} else {
navigate('/');
}
};
const confirmCancelComment = () => {
setNewComment('');
setShowCancelConfirm(false);
navigate('/');
};
const handleUpdateComment = async (commentId, content) => {
try {
setLoading(true);
const updatedComments = commentManager.updateComment(commentId, content);
await onUpdatePost({ ...post, comments: updatedComments });
setEditingId(null);
setError(null);
} catch (error) {
setError(error.message);
} finally {
setLoading(false);
}
};
const handleDeleteComment = async () => {
try {
setLoading(true);
const updatedComments = commentManager.deleteComment(commentToDelete);
await onUpdatePost({ ...post, comments: updatedComments });
setShowDeleteConfirm(false);
setCommentToDelete(null);
setError(null);
} catch (error) {
setError(error.message);
} finally {
setLoading(false);
}
};
const handleAddReply = async (commentId) => {
try {
setLoading(true);
const updatedComments = commentManager.addReply(commentId, {
content: newReply,
author: 'Usuario Actual'
});
await onUpdatePost({ ...post, comments: updatedComments });
setNewReply('');
setReplyingTo(null);
setError(null);
} catch (error) {
setError(error.message);
} finally {
setLoading(false);
}
};
const toggleExpandComment = (commentId) => {
setExpandedComments(prev => {
const newSet = new Set(prev);
if (newSet.has(commentId)) {
newSet.delete(commentId);
} else {
newSet.add(commentId);
}
return newSet;
});
};
return (
<div className="space-y-6">
{error && (
<Alert
type="error"
onClose={() => setError(null)}
autoClose={true}
>
{error}
</Alert>
)}
{/* Formulario de nuevo comentario */}
<form onSubmit={handleAddComment} className="space-y-4">
<div className="relative">
<textarea
ref={commentInputRef}
value={newComment}
onChange={(e) => setNewComment(e.target.value)}
placeholder="Escribe tu comentario..."
className="w-full p-4 border rounded-lg focus:ring-2 focus:ring-primary min-h-[100px] pr-16"
disabled={loading}
/>
<span className="absolute bottom-2 right-2 text-sm text-gray-500">
{500 - newComment.length}
</span>
</div>
<div className="flex justify-end space-x-4">
{/* Botón Cancelar */}
<button
type="button"
onClick={handleCancelComment}
className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
disabled={loading}
>
Cancelar
</button>
{/* Botón Publicar */}
<button
type="submit"
className="flex items-center px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90
disabled:opacity-50 disabled:cursor-not-allowed"
disabled={loading || !newComment.trim() || newComment.length > 500}
>
<MessageCircle className="w-4 h-4 mr-2" />
{loading ? 'Publicando...' : 'Publicar'}
</button>
</div>
</form>
{/* Lista de comentarios */}
<div className="space-y-4">
{post.comments.map(comment => (
<div key={comment.id} className="bg-white rounded-lg shadow-lg overflow-hidden">
<div className="p-4">
<div className="flex items-start justify-between">
<div className="flex items-center space-x-3">
<div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
<User className="w-6 h-6 text-primary" />
</div>
<div>
<div className="font-semibold">{comment.author}</div>
<div className="text-sm text-gray-500 flex items-center">
<Clock className="w-3 h-3 mr-1" />
{formatDate(comment.createdAt)}
{comment.updatedAt && comment.updatedAt !== comment.createdAt && (
<span className="ml-2 text-xs">(editado)</span>
)}
</div>
</div>
</div>
<div className="flex space-x-2">
<button
onClick={() => setEditingId(comment.id)}
className="p-1 hover:bg-gray-100 rounded-full transition-colors"
title="Editar comentario"
>
<Edit className="w-4 h-4" />
</button>
<button
onClick={() => {
setCommentToDelete(comment.id);
setShowDeleteConfirm(true);
}}
className="p-1 hover:bg-gray-100 rounded-full transition-colors text-red-500"
title="Eliminar comentario"
>
<Trash2 className="w-4 h-4" />
</button>
</div>
</div>
<div className="mt-4">
{editingId === comment.id ? (
<div className="space-y-2">
<textarea
ref={editInputRef}
defaultValue={comment.content}
className="w-full p-2 border rounded focus:ring-2 focus:ring-primary"
rows="3"
/>
<div className="flex justify-end space-x-2">
<button
onClick={() => setEditingId(null)}
className="px-3 py-1 text-gray-600 hover:bg-gray-100 rounded"
>
Cancelar
</button>
<button
onClick={() => handleUpdateComment(comment.id, editInputRef.current.value)}
className="px-3 py-1 bg-primary text-white rounded hover:bg-primary/90"
>
Guardar
</button>
</div>
</div>
) : (
<p className="text-gray-700">{comment.content}</p>
)}
</div>
<div className="mt-4 flex items-center space-x-4">
<button
onClick={() => setReplyingTo(comment.id)}
className="text-sm text-gray-500 hover:text-primary transition-colors"
>
Responder
</button>
{comment.replies?.length > 0 && (
<button
onClick={() => toggleExpandComment(comment.id)}
className="text-sm text-gray-500 hover:text-primary transition-colors flex items-center"
>
{comment.replies.length} {comment.replies.length === 1 ? 'respuesta' : 'respuestas'}
{expandedComments.has(comment.id) ? (
<ChevronUp className="w-4 h-4 ml-1" />
) : (
<ChevronDown className="w-4 h-4 ml-1" />
)}
</button>
)}
</div>
</div>
{expandedComments.has(comment.id) && comment.replies?.length > 0 && (
<div className="bg-gray-50 p-4 space-y-4">
{comment.replies.map(reply => (
<div key={reply.id} className="flex space-x-4">
<div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center">
<User className="w-4 h-4 text-primary" />
</div>
<div className="flex-1">
<div className="font-semibold text-sm">{reply.author}</div>
<p className="text-gray-700 text-sm mt-1">{reply.content}</p>
<div className="text-xs text-gray-500 mt-1">{formatDate(reply.createdAt)}</div>
</div>
</div>
))}
</div>
)}
{replyingTo === comment.id && (
<div className="bg-gray-50 p-4">
<textarea
value={newReply}
onChange={(e) => setNewReply(e.target.value)}
placeholder="Escribe tu respuesta..."
className="w-full p-2 border rounded focus:ring-2 focus:ring-primary"
rows="2"
onKeyDown={(e) => {
if (e.key === 'Escape') {
setReplyingTo(null);
setNewReply('');
}
}}
/>
<div className="flex justify-end space-x-2 mt-2">
<button
onClick={() => {
setReplyingTo(null);
setNewReply('');
}}
className="px-3 py-1 text-sm text-gray-600 hover:bg-gray-100 rounded"
>
Cancelar
</button>
<button
onClick={() => handleAddReply(comment.id)}
className="px-3 py-1 text-sm bg-primary text-white rounded hover:bg-primary/90"
disabled={!newReply.trim() || newReply.length > 500}
>
Responder
</button>
</div>
</div>
)}
</div>
))}
</div>
{/* Diálogo de confirmación para eliminar */}
<ConfirmDialog
isOpen={showDeleteConfirm}
onClose={() => {
setShowDeleteConfirm(false);
setCommentToDelete(null);
}}
onConfirm={handleDeleteComment}
type="DELETE"
title="Eliminar Comentario"
message="¿Estás seguro de que quieres eliminar este comentario? Esta acción no se puede deshacer."
loading={loading}
/>
{/* Diálogo de confirmación para cancelar */}
<ConfirmDialog
isOpen={showCancelConfirm}
onClose={() => setShowCancelConfirm(false)}
onConfirm={confirmCancelComment}
type="CANCEL"
title="Cancelar Comentario"
message="¿Estás seguro de que quieres cancelar? El comentario se perderá."
/>
</div>
);
};
export default CommentSection;
