import React from 'react';

function Pagination({ currentPage, itemsPerPage, totalItems, onPageChange }) {
	const pageNumbers = [];
	for (let i = 1; i <= Math.ceil(totalItems / itemsPerPage); i++) {
		pageNumbers.push(i);
	}

	return (
		<ul className="pagination">
			{pageNumbers.map((number) => (
				<li key={number} className={number === currentPage ? 'active' : ''}>
					<button type="button" onClick={() => onPageChange(number)}>
						{number}
					</button>
				</li>
			))}
		</ul>
	);
}

export default Pagination;
