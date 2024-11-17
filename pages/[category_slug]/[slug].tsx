// pages/[category_slug]/[slug].tsx
import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import axios from 'axios';
import Head from 'next/head';
import Link from 'next/link';
import CONFIG from '../../utils/config'; // Adjust the path as needed
import '../../app/post.css';
// Import Material Icons
import FavoriteIcon from '@mui/icons-material/Favorite'; // Heart icon for like
import ChatBubbleOutlineIcon from '@mui/icons-material/ChatBubbleOutline'; // Comment icon
import BookmarkIcon from '@mui/icons-material/Bookmark';
import ShareIcon from '@mui/icons-material/Share';
import ArrowBackIcon from '@mui/icons-material/ArrowBack'; // Back arrow icon
import { SiFacebook, SiWhatsapp } from 'react-icons/si';
import { FaClipboard, FaTwitter  } from 'react-icons/fa';
import { toast } from 'react-toastify';
import CommentsModal from './CommentsModel';
import 'react-toastify/dist/ReactToastify.css';

interface Post {
  id: string;
  title: string;
  content: string;
  image: string;
  category_slug: string;
  slug: string;
  avatar: string;
  username: string;
  views: number;
  created_at: string;
  read_time: string;
  category_name: string;
}

interface RelatedPost {
  id: string;
  title: string;
  slug: string;
  image: string;
  read_time: string;
}

interface TopViewedPost {
  id: string;
  title: string;
  slug: string;
  image: string;
  read_time: string;
  category_slug: string;
  category_name: string;
}

interface Props {
  initialPost: Post | null;
}

const PostPage: React.FC<Props> = ({ initialPost }) => {
  const router = useRouter();
  const { category_slug, slug } = router.query;
  const [post, setPost] = useState<Post | null>(initialPost);
  const [loading, setLoading] = useState<boolean>(!initialPost);
  const [relatedPosts, setRelatedPosts] = useState<RelatedPost[]>([]);
  const [topViewedPosts, setTopViewedPosts] = useState<TopViewedPost[]>([]); // Define the state here
  const [likeCount, setLikeCount] = useState(0);
  const [isLikedByUser, setIsLikedByUser] = useState(false);
  const [showComments, setShowComments] = useState<boolean>(false);
  const [commentCount, setCommentCount] = useState(0);
  const [isBookmarked, setIsBookmarked] = useState(false);
  const [showShareOptions, setShowShareOptions] = useState(false);


  useEffect(() => {
    const fetchData = async () => {
      try {
        // Check if post is already cached in localStorage when navigating back
        const cachedPost = localStorage.getItem(`post-${slug}`);
        if (cachedPost) {
          setPost(JSON.parse(cachedPost));
          setLoading(false);
          return; // Exit early if post is found in cache
        }

        // If post is not cached, fetch it
        if (category_slug && slug) {
          setLoading(true);

          // Fetch the post
          const response = await axios.get(`${CONFIG.BASE_URL}/apis?post_slug=${slug}`);
          const fetchedPost = response.data;
          setPost(fetchedPost);

          // Save to localStorage for cache
          localStorage.setItem(`post-${slug}`, JSON.stringify(fetchedPost));

          // Fetch related posts
          const relatedResponse = await axios.get(
            `${CONFIG.BASE_URL}/related_api.php?related_posts=${fetchedPost.category_name}&exclude_post_id=${fetchedPost.id}`
          );
          setRelatedPosts(relatedResponse.data);

          setLoading(false);
        }
      } catch (error) {
        console.error('Error fetching data:', error);
        setPost(null);
        setLoading(false);
      }
    };

    fetchData();
  }, [category_slug, slug]); // Only re-run the effect when category_slug or slug changes



  // Top viewed post 

  useEffect(() => {
    const fetchTopViewedPosts = async () => {
      try {
        if (post) {
          const response = await axios.get(`${CONFIG.BASE_URL}/related_api.php?topviewpost=true&exclude_post_id=${post.id}`);
          setTopViewedPosts(response.data);
        }
      } catch (error) {
        console.error("Error fetching top viewed posts:", error);
      }
    };

    fetchTopViewedPosts();
  }, [post]);



  useEffect(() => {
    const fetchLikes = async () => {
      if (post) {
        try {
          const response = await axios.get(`${CONFIG.BASE_URL}/api_likes?action=getLikeCount&post_id=${post.id}`);
          setLikeCount(response.data.like_count);
  
          const loggedInUser = localStorage.getItem('user');
          if (loggedInUser) {
            const foundUser = JSON.parse(loggedInUser);
            const userId = foundUser.id;
  
            const likeStatusResponse = await axios.get(`${CONFIG.BASE_URL}/api_likes?action=checkUserLike&post_id=${post.id}&user_id=${userId}`);
            setIsLikedByUser(likeStatusResponse.data.user_liked);
          }
        } catch (error) {
          console.error("Error fetching like data:", error);
        }
      }
    };
  
    fetchLikes(); // Initial fetch
  
    const intervalId = setInterval(fetchLikes, 1000); // Refresh every second
  
    return () => {
      clearInterval(intervalId); // Clear the interval on component unmount
    };
  }, [post]);
  
  
  const toggleLike = async () => {
    if (!post) return; // Early return if post is null
  
    try {
      const loggedInUser = localStorage.getItem('user');
      if (!loggedInUser) {
        toast.error("Please log in to like the post");
        return;
      }
  
      const foundUser = JSON.parse(loggedInUser);
      const userId = foundUser.id;
  
      const response = await axios.post(`${CONFIG.BASE_URL}/api_likes?action=toggle-like`, { post_id: post.id, user_id: userId });
  
      if (response.data && response.data.user) {
        localStorage.setItem('user', JSON.stringify(response.data.user));
        toast.success(`Login successful! Welcome ${response.data.user.name}!`);
      }
  
      setIsLikedByUser(prev => !prev);
      setLikeCount(prevCount => isLikedByUser ? prevCount - 1 : prevCount + 1);
      document.getElementById('like-btn')?.classList.add('heartBeatAnimation');
  
      setTimeout(() => {
        document.getElementById('like-btn')?.classList.remove('heartBeatAnimation');
      }, 500);
    } catch (error) {
      console.error("Error toggling like:", error);
    }
  };

  useEffect(() => {
    const fetchCommentCount = async () => {
      try {
        if (post) {
          const response = await axios.get(`${CONFIG.BASE_URL}/api_comment_count.php?post_id=${post.id}`);
          setCommentCount(response.data.comment_count);
        }
      } catch (error) {
        console.error("Error fetching comment count:", error);
      }
    };
  
    fetchCommentCount(); // Initial fetch
  
    const intervalId = setInterval(fetchCommentCount, 1000); // Refresh every second
  
    return () => {
      clearInterval(intervalId); // Clear the interval on component unmount
    };
  }, [post]);
  
  
  const toggleCommentsModal = () => {
    setShowComments(prevState => !prevState);
  };



  useEffect(() => {
    const checkBookmarkStatus = async () => {
      if (post) {
        try {
          const loggedInUser = localStorage.getItem('user');
          if (!loggedInUser) {
            console.warn("User not logged in");
            setIsBookmarked(false);
            return;
          }
  
          const foundUser = JSON.parse(loggedInUser);
          const userId = foundUser.id;
  
          const response = await axios.get(`${CONFIG.BASE_URL}/api_bookmark.php?action=check&user_id=${userId}&post_id=${post.id}`);
          if (response.data && typeof response.data === 'string') {
            setIsBookmarked(response.data.includes("Post is bookmarked"));
          } else {
            setIsBookmarked(false);
          }
        } catch (error: unknown) { // Specify the type of error
          console.error("Error checking bookmark status:", error);
          setIsBookmarked(false);
        }
      }
    };
  
    checkBookmarkStatus();
  }, [post]);
  
  const handleBookmarkClick = async () => {
    if (!post) return; // Add null check for post
  
    const loggedInUser = localStorage.getItem('user');
    if (!loggedInUser) {
      toast.error("Please log in to manage bookmarks");
      return;
    }
  
    const foundUser = JSON.parse(loggedInUser);
    const userId = foundUser.id;
  
    const action = isBookmarked ? 'delete' : 'add';
  
    try {
      await axios.get(`${CONFIG.BASE_URL}/api_bookmark.php?action=${action}&user_id=${userId}&post_id=${post.id}`);
      setIsBookmarked(!isBookmarked);
      if (action === 'add') {
        toast.success("Bookmark added successfully");
      } else {
        toast.success("Bookmark removed successfully");
      }
    } catch (error: unknown) { // Specify the type of error
      console.error(`Error ${action}ing bookmark:`, error);
      toast.error(`Error ${action}ing bookmark: ${error instanceof Error ? error.message : "unknown error"}`);
    }
  };
  


  const toggleShareOptions = () => {
    setShowShareOptions(!showShareOptions);
  };

  const shareOnSocialMedia = (platform: string) => {
    const url = window.location.href;
    let shareUrl = '';

    switch (platform) {
      case 'facebook':
        shareUrl = `https://www.facebook.com/sharer/sharer.php?u=${url}`;
        break;
      case 'twitter':
        shareUrl = `https://twitter.com/intent/tweet?url=${url}`;
        break;
      case 'whatsapp':
        shareUrl = `https://api.whatsapp.com/send?text=${url}`;
        break;
      default:
        break;
    }

    if (shareUrl) {
      window.open(shareUrl, '_blank');
    }
  };

  const copyLinkToClipboard = () => {
    navigator.clipboard.writeText(window.location.href)
      .then(() => toast.success("Link copied to clipboard!"))
      .catch((err) => console.error("Could not copy link: ", err));
  };
  
  const formatViews = (views: number): string => {
    if (views >= 10000000) return Math.floor(views / 10000000) + 'cr';
    if (views >= 1000000) return Math.floor(views / 1000000) + 'M';
    if (views >= 100000) return Math.floor(views / 100000) + 'L';
    if (views >= 1000) return Math.floor(views / 1000) + 'k';
    return views.toString();
  };

  const truncateText = (text: string, limit: number) => {
    const words = text.split(' ');
    return words.length > limit ? `${words.slice(0, limit).join(' ')}...` : text;
  };

  const truncateTitle = (title: string, limit: number): string => {
  if (title.length > limit) {
    return title.slice(0, limit) + '...';
  }
  return title;
};

  const formatDate = (dateString: string) => {
    const now = new Date();
    const postDate = new Date(dateString);
    const secondsDiff = Math.floor((now.getTime() - postDate.getTime()) / 1000);

    if (secondsDiff < 60) return 'just now';
    if (secondsDiff < 3600) return `${Math.floor(secondsDiff / 60)} min ago`;
    if (secondsDiff < 86400) return `${Math.floor(secondsDiff / 3600)} hours ago`;
    if (secondsDiff < 2592000) return `${Math.floor(secondsDiff / 86400)} days ago`;
    if (secondsDiff < 31536000) return `${Math.floor(secondsDiff / 2592000)} months ago`;

    return `${Math.floor(secondsDiff / 31536000)} years ago`;
  };

  const domain = typeof window !== 'undefined' ? window.location.origin : '';

  return (
    <>
      <Head>
        <title>{post ? post.title : 'Loading...'}</title>
        <meta property="og:title" content={post ? post.title : 'Loading...'} />
        <meta property="og:description" content={post ? post.content.slice(0, 150) + '...' : 'Loading...'} />
        <meta property="og:image" content={post ? post.image : ''} />
        <meta property="og:url" content={post ? `${domain}/${category_slug}/${slug}` : ''} />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content={post ? post.title : 'Loading...'} />
        <meta name="twitter:description" content={post ? post.content.slice(0, 150) + '...' : 'Loading...'} />
        <meta name="twitter:image" content={post ? post.image : ''} />
        {post && (
          <link rel="icon" href={post.image} sizes="any" />
          )}
      </Head>
      <header>
      <div className="custom-header">
    
      <ArrowBackIcon
  style={{ cursor: 'pointer', marginRight: '5px' }}
  onClick={() => router.back()}
/>
    
    <p className='post-title-he'>
    {post ? truncateTitle(post.title, 100) : 'Loading...'}
    </p>
  </div>
   </header> 
      <div className="post-container">
        {loading ? (
          <div style={{ marginBottom: '20px' }}>
            <div style={{ backgroundColor: '#e0e0e0', marginBottom: '10px', borderRadius: '4px', boxShadow: '0 2px 5px rgba(0, 0, 0, 0.1)', height: '30px', width: '80%' }} />
            <div style={{ backgroundColor: '#e0e0e0', marginBottom: '10px', borderRadius: '12px', boxShadow: '0 2px 5px rgba(0, 0, 0, 0.1)', height: '200px', width: '100%' }} />
            {Array.from({ length: 10 }, (_, index) => (
              <div key={index} style={{ backgroundColor: '#e0e0e0', marginBottom: '10px', borderRadius: '4px', boxShadow: '0 2px 5px rgba(0, 0, 0, 0.1)', height: '20px', width: '60%' }} />
            ))}
          </div>
        ) : !post ? (
          <p>Post not found.</p>
        ) : (
          <>
            <img 
              src={post.image} 
              alt={post.title} 
              width={800} 
              height={400} 
              className="post-image" 
              
            />
            <div className="post-meta">
              <img 
                src={`${CONFIG.BASE_URL}/${post.avatar}`} 
                alt='Avatar' 
                width={40}
                height={40}
                className="avatar-image"
              />
              <span>{post.username} • {formatViews(post.views)} views</span>
              <span> • {formatDate(post.created_at)}</span>
              <span> • {post.read_time} min read</span>
            </div>
            <div className='content_post'>
            <h1 className="post-title">{post.title}</h1>
            <div className="post-content" dangerouslySetInnerHTML={{ __html: post.content }} />
            </div>
              {/* Related posts */}
        {relatedPosts.length > 0 && (
          <div className="related-posts">
            <h2>Also Read</h2>
            <div className="related-posts-container">
              {relatedPosts.map((relatedPost, index) => (
                <div className="related-post-card" key={index}>
                  <Link href={`/${post.category_name}/${relatedPost.slug}`}>
                    <div className="image-container" style={{position: 'relative'}}>
                      <img src={relatedPost.image} alt={relatedPost.title} />
                      <div className="related_read-time-overlay">{relatedPost.read_time} min read</div>
                    </div>
                    <div className="post-details">
                      <h3 className="post-title">{truncateText(relatedPost.title, 20)}</h3>
                      {/* <p className="post-excerpt">{relatedPost.excerpt}</p> */}
                    </div>
                  </Link>
                </div>
              ))}
            </div>
          </div>
        )}

            {/* Related Posts Section */}
            {/* {relatedPosts.length > 0 && (
              <div className="related-posts">
                <h2>Related Posts</h2>
                <ul>
                  {relatedPosts.map((relatedPost) => (
                    <li key={relatedPost.id}>
                      <a href={`/${post.category_slug}/${relatedPost.slug}`} className="related-post-link">
                        <div className="related-post-image-container">
                          <img 
                            src={relatedPost.image} 
                            alt={relatedPost.title} 
                          
                            className="related-post-image"
                        
                          />
                          <span className="read-time-overlay">{relatedPost.read_time} min read</span>
                        </div>
                        <span>{truncateText(relatedPost.title, 10)}</span>
                      </a>
                    </li>
                  ))}
                </ul>
              </div>
            )} */}
             {topViewedPosts.length > 0 && (
        <div className="you-might-like outside-container">
          <h2>You Might Like</h2>
          <div className="top-viewed-posts-container">
            {topViewedPosts.map((topViewedPost, index) => (
              <div className="top-viewed-post-card" key={index}>
                <Link href={`/${topViewedPost.category_slug}/${topViewedPost.slug}`} className="card-link">
                  <div className="image-container">
                    <img src={topViewedPost.image} alt={topViewedPost.title} className="top-viewed-post-image" />
                    <div className="read-time-overlay">{topViewedPost.read_time} min read</div>
                  </div>
                  <div className="text-container">
                    <h3 className="top-viewed-post-title">{truncateText(topViewedPost.title, 20)}</h3>
                    <p className="top-viewed-post-category">{topViewedPost.category_name}</p>
                  </div>
                </Link>
              </div>
            ))}
          </div>
        </div>
      )}
          </>
        )}
      </div>
       {/* Share Icons Container */}
   <div className="share-icons-container">
   <div className="icon-ir" onClick={toggleLike} id="like-btn">
   <FavoriteIcon style={{ color: isLikedByUser ? 'red' : '' }} className='icon-in' />
   <span id="like-count">{likeCount} {likeCount === 1 ? 'Like' : 'Likes'}</span>
        </div>
        <div className="icon-ir" onClick={toggleCommentsModal}>
                <ChatBubbleOutlineIcon className='icon-in' />
                <span id="comment-count">{commentCount} {commentCount === 1 ? 'comment' : 'comments'}</span>

              </div>
 
              <div className="icon-ir" onClick= {handleBookmarkClick}>
        
  <BookmarkIcon style={{ color: isBookmarked ? 'red' : '' }} className='icon-in' /> 
  <span id="comment-count">{isBookmarked ? 'Bookmarked' : 'Bookmark'}</span>

              </div>
              <div className="icon-ir" onClick={toggleShareOptions}>
                <ShareIcon className='icon-in'  />
                <span id="comment-count">Share</span>
              </div>
              {post && (
              <CommentsModal isOpen={showComments} onClose={toggleCommentsModal} postId={post.id} />
            )}

{showShareOptions && (
        <div className="modal-backdrop" onClick={() => setShowShareOptions(false)}>
          <div className="share-options-modal" onClick={(e) => e.stopPropagation()}>
            <h2>Share this post</h2>
            <div className="share-option" onClick={() => shareOnSocialMedia('facebook')}>
              <SiFacebook className="share-option-icon" /> Share on Facebook
            </div>
            <div className="share-option" onClick={() => shareOnSocialMedia('twitter')}>
              <FaTwitter className="share-option-icon" /> Share on Twitter
            </div>
            <div className="share-option" onClick={() => shareOnSocialMedia('whatsapp')}>
              <SiWhatsapp className="share-option-icon" /> Share on WhatsApp
            </div>
            <div className="share-option" onClick={copyLinkToClipboard}>
              <FaClipboard className="share-option-icon" /> Copy Link
            </div>
          </div>
        </div>
      )}
            </div>
    </>
  );
};

// Static generation with revalidation every 10 seconds
export async function getStaticProps({ params }: any) {
  const { slug } = params;
  try {
    const response = await axios.get(`${CONFIG.BASE_URL}/apis?post_slug=${slug}`);
    const postData = response.data;

    return {
      props: {
        initialPost: postData || null,
      },
      revalidate: 60, // Regenerate the page at most every 60 seconds
    };
  } catch (error) {
    return {
      props: {
        initialPost: null,
      },
    };
  }
}

export async function getStaticPaths() {
  // Here you would fetch and return all post slugs, if possible
  return {
    paths: [],
    fallback: true,
  };
}

export default PostPage;
