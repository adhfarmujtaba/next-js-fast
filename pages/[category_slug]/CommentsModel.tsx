import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { formatDistanceToNow } from 'date-fns';
import { ClipLoader } from 'react-spinners';
import { toast } from 'react-toastify';
import CONFIG from '../../utils/config';
import '../../app/commentsModal.css';

interface CommentsModalProps {
    isOpen: boolean;
    onClose: () => void;
    postId: string; // Change to number if needed
}

const CommentsModal: React.FC<CommentsModalProps> = ({ isOpen, onClose, postId }) => {
    const [comments, setComments] = useState<Array<{ id: string; username: string; avatar: string; content: string; created_at: string }>>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [newComment, setNewComment] = useState('');
    const [user, setUser] = useState<{ id: string; avatar: string } | null>(null);
    const [showFullComment, setShowFullComment] = useState<Record<number, boolean>>({});
    const [isLoadingMore, setIsLoadingMore] = useState(false);
    const [hasMoreComments, setHasMoreComments] = useState(true); // Track if there are more comments

    useEffect(() => {
        const loggedInUser = localStorage.getItem('user');
        if (loggedInUser) {
            const foundUser = JSON.parse(loggedInUser);
            setUser(foundUser);
        }
    }, []);

    const fetchComments = useCallback(async () => {
        if (isOpen && postId) {
            setIsLoading(true);
            try {
                const response = await axios.get(`${CONFIG.BASE_URL}/api_comments.php?post_id=${postId}`);
                setComments(response.data);
                setHasMoreComments(response.data.length > 0); // Check if there are any comments
            } catch (error) {
                console.error("There was an error fetching the comments:", error);
            } finally {
                setIsLoading(false);
            }
        }
    }, [isOpen, postId]);

    useEffect(() => {
        fetchComments();
    }, [isOpen, postId, fetchComments]);

    const postComment = async () => {
        if (!user) {
            toast.error("Please log in to post the comment");
            return;
        }

        if (!newComment.trim()) return;

        const commentData = {
            post_id: postId,
            user_id: user.id,
            content: newComment,
        };

        try {
            await axios.post(`${CONFIG.BASE_URL}/api_comments.php`, commentData);
            fetchComments();
            setNewComment('');
        } catch (error) {
            console.error("There was an error posting the comment:", error);
        }
    };


    const toggleFullComment = (commentIndex: number) => {
        setShowFullComment((prev) => ({
            ...prev,
            [commentIndex]: !prev[commentIndex],
        }));
    };

    const loadMoreComments = useCallback(async () => {
        if (!hasMoreComments ) return; // Stop if there are no more comments

        setIsLoadingMore(true);
        await new Promise(resolve => setTimeout(resolve, 50));
        const offset = comments.length;
        const limit = 10;
        try {
            const response = await axios.get(`${CONFIG.BASE_URL}/api_comments.php?post_id=${postId}&offset=${offset}&limit=${limit}`);
            if (response.data.length > 0) {
                setComments(prevComments => [...prevComments, ...response.data]);
            } else {
                setHasMoreComments(false); // No more comments to load
            }
        } catch (error) {
            console.error("There was an error fetching more comments:", error);
        } finally {
            setIsLoadingMore(false);
        }
    }, [comments.length, postId, hasMoreComments]);

    const handleObserver = useCallback((entries: IntersectionObserverEntry[]) => {
        const target = entries[0];
        if (target.isIntersecting && hasMoreComments) {
            loadMoreComments();
        }
    }, [loadMoreComments, hasMoreComments]);

    useEffect(() => {
        if (!hasMoreComments) return; // Skip observer setup if no more comments

        const observer = new IntersectionObserver(handleObserver, { threshold: 1 });
        const targetElement = document.getElementById('observer-target');
        if (targetElement) {
            observer.observe(targetElement);
        }
        return () => {
            if (targetElement) {
                observer.unobserve(targetElement);
            }
        };
    }, [handleObserver, hasMoreComments]);

    return isOpen ? (
        <div className={`modal show ${isOpen ? 'modal-visible' : ''}`}>
            <div className="modal-content">
                <div id="modelHeader" className="modal-header">
                    <h2>Comments</h2>
                    <span className="close" onClick={onClose}>&times;</span>
                </div>
                <div className="modal-body">
                    {isLoading ? (
                        <div className="loading-comments-placeholder">
                            {[...Array(7)].map((_, index) => (
                                <div className="loading-comment-item" key={index}>
                                    <div className="loading-avatar"></div>
                                    <div className="loading-details">
                                        <div className="loading-line loading-name"></div>
                                        <div className="loading-line loading-message"></div>
                                        <div className="loading-line loading-message"></div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <>
                            {comments.length === 0 ? (
                                <div className="no-comments-message">No comments yet.</div>
                            ) : (
                                <>
                                    {comments.map((comment, index) => (
                                        <div key={index} className="comment">
                                            <div className="comment-avatar">
                                                <img src={comment.avatar} alt="Avatar" />
                                            </div>
                                            <div className="comment-content">
                                                <div className="comment-header">
                                                    <a className="comment-author" style={{ color: '#777', textDecoration: 'none' }} href={`#${comment.username}`}>
                                                        {comment.username}
                                                    </a>
                                                    <span className="comment-date">
                                                        {formatDistanceToNow(new Date(comment.created_at), { addSuffix: true })}
                                                    </span>
                                                </div>
                                                <div className="comment-text">
                                                    {showFullComment[index] ? (
                                                        <>
                                                            {comment.content}{' '}
                                                            <a href="#!" className="read-more-link" onClick={() => toggleFullComment(index)}>Read less</a>
                                                        </>
                                                    ) : (
                                                        <>
                                                            {comment.content.length > 100 ? `${comment.content.substring(0, 100)}...` : comment.content}
                                                            {comment.content.length > 100 && (
                                                                <a href="#!" className="read-more-link" onClick={() => toggleFullComment(index)}>Read more</a>
                                                            )}
                                                        </>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                    <div id="observer-target"></div>
                                </>
                            )}
                        </>
                    )}
                </div>
                {isLoadingMore && (
                    <div className='loader'>
                    <ClipLoader color="#000" size={30} />
                </div>
                )}
                <div className="modal-footer">
                    <input
                        type="text"
                        className="comment-input"
                        placeholder="Add a comment..."
                        value={newComment}
                        onChange={e => setNewComment(e.target.value)}
                    />
                    <button className="submit-comment-btn" onClick={postComment}>Post</button>
                </div>
            </div>
        </div>
    ) : null;
};

export default CommentsModal;
