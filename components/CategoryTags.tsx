// pages/category-tags.tsx
import { useEffect, useState, useRef } from 'react';
import axios from 'axios';
import Link from 'next/link';
import { useRouter } from 'next/router';
import './header.css';

interface Category {
  name: string;
  slug: string;
}

const CategoryTags: React.FC = () => {
  const router = useRouter();
  const [categories, setCategories] = useState<Category[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const activeTagRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const fetchCategories = async () => {
      setIsLoading(true);
      try {
        const response = await axios.get('https://blog.tourismofkashmir.com/apis?categories&order_index=asc&header_menu_is_included=TRUE');
        setCategories(response.data);
      } catch (error) {
        console.error("Error fetching categories:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchCategories();
  }, []);

  useEffect(() => {
    // Scroll to the active tag after categories are fetched
    if (activeTagRef.current) {
      activeTagRef.current.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  }, [categories]);

  return (
    <div className="category-tags">
      {isLoading ? (
        <div className="category-tags-loading">
          {/* Skeleton loading states */}
          <div className="loading-tag" style={{ width: '50px', height: '35px' }}></div>
          <div className="loading-tag" style={{ width: '120px', height: '35px' }}></div>
          <div className="loading-tag" style={{ width: '90px', height: '35px' }}></div>
          <div className="loading-tag" style={{ width: '110px', height: '35px' }}></div>
        </div>
      ) : (
        <>
          <Link href="/">
            <div className={`category-tag ${router.asPath === '/' ? 'active' : ''}`}>
              All
            </div>
          </Link>
          {categories.map((category) => {
            const isActive = router.asPath === `/${category.slug}`;
            return (
              <Link key={category.slug} href={`/${category.slug}`}>
                <div
                  ref={isActive ? activeTagRef : null}
                  className={`category-tag ${isActive ? 'active' : ''}`}
                >
                  {category.name}
                </div>
              </Link>
            );
          })}
        </>
      )}
    </div>
  );
};

export default CategoryTags;
