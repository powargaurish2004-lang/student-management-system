function SearchBar({
  searchTerm,
  setSearchTerm,
}) {
  return (
    <div className="search-box">

      <span>
        🔍
      </span>

      <input
        type="text"
        value={searchTerm}
        onChange={(e) =>
          setSearchTerm(
            e.target.value
          )
        }
        placeholder="Search by student name..."
      />

    </div>
  );
}

export default SearchBar;