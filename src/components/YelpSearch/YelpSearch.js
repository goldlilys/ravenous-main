import React, { useState, useEffect, useCallback } from 'react';
import getSuggestions from '../../utils/yelp';

function YelpSearch() {
	const [results, setResults] = useState([]);
	const [pageNumber, setPageNumber] = useState(1);
	const [loading, setLoading] = useState(false);

	const loadMore = useCallback(async () => {
		if (loading) return;

		setLoading(true);

		try {
			const keyword = "food";
			const location = "US";
			const sort = "best_match";

			const newResults = await getSuggestions(keyword, location, sort, pageNumber);
			setResults([...results, ...newResults]);
			setPageNumber(pageNumber + 1);
		} catch (error) {
			console.log(error);
		} finally {
			setLoading(false);
		}
	}, [results, loading, pageNumber]);

	useEffect(() => {
		loadMore();
	}, [loadMore]);

	useEffect(() => {
		const handleScroll = () => {
			if (
				window.innerHeight + window.scrollY >= document.documentElement.scrollHeight - 200 &&
				results.length > 0
			) {
				loadMore();
			}
		};

		window.addEventListener('scroll', handleScroll);
		return () => window.removeEventListener('scroll', handleScroll);
	}, [results, loadMore]);

	return (
		<div>
			<ul>
				{results.map((business) => (
					<li key={business.id}>{business.name}</li>
				))}
			</ul>
			{loading && <p>Loading...</p>}
		</div>
	);
};

export default YelpSearch;