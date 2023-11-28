import './App.css';
import React, { useState, useEffect, useRef } from 'react';
import BusinessList from '../BusinessList/BusinessList';
import SearchBar from '../SearchBar/SearchBar';
import Pagination from '../Pagination/Pagination';
import getSuggestions from '../../utils/yelp';

function App() {
  const [businesses, setBusinesses] = useState([]);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(0);
  const [noMoreData, setNoMoreData] = useState(false); // State for no more data message
  const itemsPerPage = 12; // Number of items to display per page

  const loadMoreData = useRef(null);
  const canLoadMore = useRef(true);

  const cache = useRef({}); // Cache to store the results
  const cacheTimeout = 1800000; // Cache results for 30 minutes (1,800,000 milliseconds)

  loadMoreData.current = async (keyword, location, sort) => {
    if (loading || !canLoadMore.current) return;

    const cacheKey = `${keyword}_${location}_${sort}_${page + 1}`;
    const cachedData = cache.current[cacheKey];

    if (cachedData) {
      // If data is found in the cache, use it and return
      setBusinesses([...businesses, ...cachedData]);

      // Display items for the current page
      // setBusinesses(cachedData.slice(0, (page + 1) * itemsPerPage));

      setPage(page + 1);
      setLoading(false);
      return;
    }

    setLoading(true);
    const suggestions = await getSuggestions(keyword, location, sort, page + 1);

    if (suggestions.length > 0) {
      // Filter the suggestions based on the search criteria
      const filteredSuggestions = suggestions.filter((business) => {
        const businessName = business.name.toLowerCase();
        const searchKeyword = keyword.toLowerCase();
        const searchLocation = location.toLowerCase();

        // Check if business.location is defined before accessing its properties
        const businessLocation = business.location && business.location.display_address
          ? `${business.location.display_address[0]} ${business.location.display_address[1]}`.toLowerCase()
          : '';

        return (
          businessName.includes(searchKeyword) && businessLocation.includes(searchLocation)
        );
      });

      // Cache the data and store it in the cache object with a timeout
      cache.current[cacheKey] = filteredSuggestions;
      setTimeout(() => {
        delete cache.current[cacheKey];
      }, cacheTimeout);

      setBusinesses([...businesses, ...filteredSuggestions]);

      // Display items for the current page
      // setBusinesses(suggestions.slice(0, (page + 1) * itemsPerPage));
      setPage(page + 1);
    } else {
      canLoadMore.current = false; // No more data to load
      setNoMoreData(true); // Set the no more data message flag
    }

    setLoading(false);
  };

  // const handlePageChange = (newPage) => {
  //   setPage(newPage);
  //   const cachedData = cache.current[`${keyword}_${location}_${sort}_${newPage}`];
  //   if (cachedData) {
  //     setBusinesses(cachedData.slice(0, (newPage + 1) * itemsPerPage));
  //   } else {
  //     loadMoreData.current(keyword, location, sort);
  //   }
  // };

  const searchYelp = async (keyword, location, sort) => {
    const suggestions = await getSuggestions(keyword, location, sort);
    setBusinesses(suggestions);
  };

  useEffect(() => {
    searchYelp("food", "US", "best_match");
  }, []);

  useEffect(() => {
    // Add a scroll event listener to the window or a specific scrollable element.
    const handleScroll = () => {
      if (
        window.innerHeight + document.documentElement.scrollTop >= document.documentElement.scrollHeight - 100 &&
        businesses.length > 0
      ) {
        loadMoreData.current("food", "US", "best_match");
      }
    };

    window.addEventListener("scroll", handleScroll);

    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  }, [businesses]); // Make sure to add businesses as a dependency

  return (
    <div className="App">
      <header>
        <h1>Ravenous</h1>
      </header>
      <main>
        <SearchBar searchYelp={searchYelp} />
        <BusinessList businesses={businesses} />
        {loading && <p>Loading more businesses...</p>}
        {noMoreData && <p>No more data to load.</p>}
        {/* <Pagination
          currentPage={page}
          itemsPerPage={itemsPerPage}
          totalItems={businesses.length} // Change to the total number of items you have
        onPageChange={handlePageChange}
        /> */}
      </main>
      <footer>

      </footer>
    </div>
  );
};

export default App;