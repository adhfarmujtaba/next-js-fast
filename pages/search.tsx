import React, { useState, useEffect, useCallback, useRef } from 'react';
import axios from 'axios';
import Head from 'next/head';
import Link from 'next/link';
import { debounce } from 'lodash';
import { IconButton, AppBar, Toolbar, InputBase } from '@mui/material';
import CloseIcon from '@mui/icons-material/Close'; // Import CloseIcon
import CONFIG from '../utils/config'; // Adjust the path as needed
import '../app/search.css'; // Import your styles here

interface SearchResult {
  id: string;
  categorySlug: string;
  slug: string;
  title: string;
  excerpt: string;
  image?: string; // Optional if not every result has an image
}

const SearchPage: React.FC = () => {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<SearchResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const inputRef = useRef<HTMLInputElement | null>(null); // Create a ref for the input

  const fetchResults = useCallback(async (searchQuery: string) => {
    if (!searchQuery) {
      setResults([]);
      return;
    }

    setLoading(true);
    setError('');

    try {
      const response = await axios.get(`${CONFIG.BASE_URL}/apisearch?search=${searchQuery}`);
      setResults(response.data);
    } catch (err) {
      console.error('Error fetching search results:', err);
      setError('Failed to fetch results. Please try again.');
    } finally {
      setLoading(false);
    }
  }, []);

  const debouncedFetchResults = useCallback(debounce(fetchResults, 300), [fetchResults]);

  useEffect(() => {
    debouncedFetchResults(query);
    return () => {
      debouncedFetchResults.cancel(); // Cleanup the debounce on unmount
    };
  }, [query, debouncedFetchResults]);

  useEffect(() => {
    if (inputRef.current) {
      inputRef.current.focus(); // Focus the input when the component mounts
    }
  }, []);

  return (
    <>
      <Head>
        <title>Search Results for &quot;{query}&quot;</title>
      </Head>
      <AppBar position="static" color="default" className='appBar'>
        <Toolbar style={{ justifyContent: 'space-between' }}>
          <div className="seach-hed">
          <InputBase 
            inputRef={inputRef} // Attach the ref to the input
            placeholder="Search…"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
          </div>
          <IconButton color="inherit" onClick={() => window.history.back()} style={{ marginLeft: 'auto' }}>
            <CloseIcon className='closeSearchIcon' />
          </IconButton>
        </Toolbar>
      </AppBar>

      <div className="search-container">
        {loading && <div className="spinner"></div>}
        {error && <p className="error">{error}</p>}
        
        {/* {query === '' && !loading && (
          <p className="initial-message" style={{
            textAlign: 'center',
            fontSize: '18px',
            color: '#555',
            marginTop: '20px',
            padding: '10px',
            backgroundColor: '#f9f9f9',
            borderRadius: '8px',
            boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)',
            transition: 'all 0.3s ease-in-out'
          }}>
            Please enter a query to search.
          </p>
        )}
         */}
        {results.length > 0 && (
  <div className="search-results">
    {results.map((post) => (
      <div key={post.id} className="search-result-item">
        <Link href={`/${post.categorySlug}/${post.slug}`} style={{ color: 'inherit', textDecoration: 'none', display: 'flex', alignItems: 'center' }}>
          {post.image && (
            <img src={post.image} alt={post.title} className="search-image" />
          )}
          <h3 className='title-search'>{post.title}</h3>
        </Link>
      </div>
    ))}
  </div>
)}

      </div>
    </>
  );
};

export default SearchPage;
