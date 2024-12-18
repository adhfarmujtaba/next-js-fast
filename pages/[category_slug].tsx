import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import Link from 'next/link';
import InfiniteScroll from 'react-infinite-scroll-component';
import { useRouter } from 'next/router';
import { ClipLoader } from 'react-spinners';
import Head from 'next/head'; // Import Head
import CONFIG from '../utils/config'; // Adjust the path as needed
import '../app/index.css';

const SkeletonLoader = () => (
    <div className='skeleton-container'>
        {Array.from({ length: 10 }).map((_, index) => (
            <div key={index} className='card skeleton-card'>
                <div className='skeleton-image'></div>
                <div className='card-content'>
                    <div className='skeleton-title'></div>
                    <div className='skeleton-content'></div>
                    <div style={{ display: 'flex', alignItems: 'center' }}>
                        <div className='skeleton-avatar'></div>
                        <div className='skeleton-username'></div>
                        <div className='skeleton-date'></div>
                    </div>
                </div>
            </div>
        ))}
    </div>
);

interface Post {
    id: string;
    slug: string;
    category_slug: string;
    category_name: string; // Add category_name to the Post interface
    image: string;
    title: string;
    meta_description: string;
    read_time: string;
    username: string;
    avatar: string;
    views: number;
    created_at: string;
}

interface CategoryListProps {
    categoryName: string; // Category name passed as prop
}



const CategoryList: React.FC<CategoryListProps> = ({ categoryName }) => {
        const [categoryPosts, setCategoryPosts] = useState<Post[]>([]);
    const [page, setPage] = useState(1);
    const [hasMore, setHasMore] = useState(true);
    const [isEmpty, setIsEmpty] = useState(false);
    const [isInitialLoad, setIsInitialLoad] = useState(true);
    const [loading, setLoading] = useState(false);
    const router = useRouter();
    const { category_slug } = router.query;

    const fetchCategoryPosts = useCallback(async (pageNum: number) => {
        if (!category_slug) return;
        setLoading(true);
        try {
            const response = await axios.get(`${CONFIG.BASE_URL}/apis?category_slug=${category_slug}&page=${pageNum}`);
            const newPosts: Post[] = response.data;

            if (Array.isArray(newPosts) && newPosts.length > 0) {
                setCategoryPosts((prevPosts) => [...prevPosts, ...newPosts]);
                setIsEmpty(false);
            } else if (pageNum === 1 && newPosts.length === 0) {
                setIsEmpty(true);
                setHasMore(false);
            } else {
                setHasMore(false);
            }
        } catch (error) {
            console.error('Error fetching category posts:', error);
            setHasMore(false);
        } finally {
            setLoading(false);
            setIsInitialLoad(false);
        }
    }, [category_slug]);

    useEffect(() => {
        if (category_slug) {
            setCategoryPosts([]);
            setPage(1);
            setHasMore(true);
            setIsEmpty(false);
            setIsInitialLoad(true);
            fetchCategoryPosts(1);
        }
    }, [category_slug, fetchCategoryPosts]);

    const fetchMoreData = () => {
        if (hasMore) {
            const nextPage = page + 1;
            setPage(nextPage);
            fetchCategoryPosts(nextPage);
        }
    };


    return (
        <>
            <Head>
                <title>{categoryName} - Leak News</title>
                <meta property="og:title" content={categoryName} />
                <meta property="og:description" content={`Explore posts from the ${categoryName} category.`} />
                <meta property="og:type" content="website" />
                <meta property="og:url" content={router.asPath} />
            </Head>
            <div className="category-list news-list">
                {isInitialLoad ? (
                    <SkeletonLoader />
                ) : isEmpty ? (
                    <div className="empty-category-message">
                    <div 
                        style={{ 
                            textAlign: 'center', 
                            padding: '30px', 
                            border: '1px solid #ddd', 
                            borderRadius: '8px', 
                            backgroundColor: '#f0f4f8', 
                            boxShadow: '0 2px 10px rgba(0, 0, 0, 0.1)' 
                        }}
                    >
                        <p style={{ fontSize: '20px', color: '#333', marginBottom: '10px' }}>
                            No Posts Available
                        </p>
                        <p style={{ fontSize: '16px', color: '#666', marginBottom: '20px' }}>
                            There are currently no posts in this category.
                        </p>
                       
                    </div>
                    </div>
                ) : (
                    <InfiniteScroll
                        dataLength={categoryPosts.length}
                        next={fetchMoreData}
                        hasMore={hasMore}
                        loader={
                            <div style={{ display: 'flex', justifyContent: 'center', padding: '20px' }}>
                                <ClipLoader color="#000" loading={loading} size={30} />
                            </div>
                        }
                        endMessage={
                            <p style={{ textAlign: 'center' }}>
                                <b>Yay! You have seen it all</b>
                            </p>
                        }
                    >
                        {categoryPosts.map((post) => (
                            <div key={post.id || post.slug} className="card" onContextMenu={(e) => e.preventDefault()} onClick={() => router.push(`/${post.category_slug}/${post.slug}`)}>
                                    <div className="image-container" style={{ position: "relative" }}>
                                        <img src={post.image} alt={post.title} className="news-item-image" style={{ width: "100%", height: "180px", objectFit: "cover" }} />
                                        <div style={{ position: "absolute", bottom: "10px", right: "10px", backgroundColor: "rgba(0, 0, 0, 0.5)", color: "white", padding: "5px", borderRadius: "5px", fontSize: "0.8rem" }}>
                                            {post.read_time} min read
                                        </div>
                                    </div>
                                    <div className='card-content'>
                                    <h2>{truncateText(post.title, 20)}</h2>
                                    <p>{truncateText(post.meta_description, 22)}</p>
                                    </div>
                                <div style={{ display: 'flex', alignItems: 'center', marginBottom: '5px' }}>
                                    <Link href={`/profile/${post.username}`} style={{ textDecoration: 'none', color: 'inherit', display: 'flex', alignItems: 'center' }}>
                                        <img src={`https://blog.tourismofkashmir.com/${post.avatar}`} alt='Avatar' className='avatar' style={{ width: '30px', height: '30px', borderRadius: '50%', marginRight: '5px' }} />
                                        <span className='username'>{post.username}</span>
                                    </Link>
                                    <span className='views'>. {formatViews(post.views)} views</span>
                                    <span className='date'>{formatDate(post.created_at)}</span>
                                </div>
                            </div>
                        ))}
                    </InfiniteScroll>
                )}
            </div>
        </>
    );
};

import { GetServerSideProps } from 'next';

export const getServerSideProps: GetServerSideProps = async (context) => {
    const { category_slug } = context.query;

    // Set the category name based on the slug, or use a default name
    const categoryName = category_slug ? (category_slug as string).replace(/-/g, ' ') : 'Default Category';

    return {
        props: {
            categoryName,
        },
    };
};


export const formatViews = (views: number): string => {
    if (views >= 10000000) {
        return Math.floor(views / 10000000) + 'cr';
    } else if (views >= 1000000) {
        return Math.floor(views / 1000000) + 'M';
    } else if (views >= 100000) {
        return Math.floor(views / 100000) + 'L';
    } else if (views >= 1000) {
        return Math.floor(views / 1000) + 'k';
    } else {
        return views.toString();
    }
};

export const formatDate = (date: string): string => {
    const currentDate = new Date();
    const postDate = new Date(date);
    const timeDifference = currentDate.getTime() - postDate.getTime();
    const seconds = Math.floor(timeDifference / 1000);
    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);
    const yearsDifference = currentDate.getFullYear() - postDate.getFullYear();

    if (seconds < 60) {
        return seconds + ' sec ago';
    } else if (minutes < 60) {
        return minutes + ' mins ago';
    } else if (hours < 24) {
        return hours + ' hours ago';
    } else if (days < 7) {
        return days + ' days ago';
    } else if (days < 30) {
        const weeks = Math.floor(days / 7);
        return weeks + ' weeks ago';
    } else if (yearsDifference < 1) {
        return days + ' days ago';
    } else {
        return yearsDifference + ' years ago';
    }
};

const truncateText = (text: string, limit: number) => {
    const words = text.split(' ');
    return words.length > limit ? `${words.slice(0, limit).join(' ')}...` : text;
  };

export default CategoryList;  