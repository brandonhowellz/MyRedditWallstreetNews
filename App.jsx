const Pagination = ({ items, pageSize, onPageChange }) => {
    const { Button } = ReactBootstrap;
    if (items.length <= 1) return null;
  
    let num = Math.ceil(items.length / pageSize);
    let pages = range(1, num + 1);
    const list = pages.map((page) => {
      return (
        <Button key={page} onClick={onPageChange} className="page-item">
          {page}
        </Button>
      );
    });
    return (
      <nav>
        <ul className="pagination justify-content-center">{list}</ul>
      </nav>
    );
  };
  
  const range = (start, end) => {
    return Array(end - start + 1)
      .fill(0)
      .map((item, i) => start + i);
  };
  
  function paginate(items, pageNumber, pageSize) {
    const start = (pageNumber - 1) * pageSize;
    let page = items.slice(start, start + pageSize);
    return page;
  }
  
  const useDataApi = (initialUrl, initialData) => {
    const { useState, useEffect, useReducer } = React;
    const [url, setUrl] = useState(initialUrl);
  
    const [state, dispatch] = useReducer(dataFetchReducer, {
      isLoading: false,
      isError: false,
      data: initialData,
    });
  
    useEffect(() => {
      let didCancel = false;
      const fetchData = async () => {
        dispatch({ type: "FETCH_INIT" });
        try {
          const result = await axios(url);
          if (!didCancel) {
            dispatch({ type: "FETCH_SUCCESS", payload: result.data });
          }
        } catch (error) {
          if (!didCancel) {
            dispatch({ type: "FETCH_FAILURE" });
          }
        }
      };
      fetchData();
      return () => {
        didCancel = true;
      };
    }, [url]);
    return [state, setUrl];
  };
  
  const dataFetchReducer = (state, action) => {
    switch (action.type) {
      case 'FETCH_INIT':
        return {
          ...state,
          isLoading: true,
          isError: false,
        };
      case 'FETCH_SUCCESS':
        return {
          ...state,
          isLoading: false,
          isError: false,
          data: action.payload,
        };
      case 'FETCH_FAILURE':
        return {
          ...state,
          isLoading: false,
          isError: true,
        };
      default:
        throw new Error();
    }
  };
  
  function App() {
    const { Fragment, useState, useEffect, useReducer } = React;
    const [query, setQuery] = useState('MIT');
    const [currentPage, setCurrentPage] = useState(1);
    const pageSize = 10;
    const [{ data, isLoading, isError }, doFetch] = useDataApi(
      "https://www.reddit.com/r/Wallstreetbets/top.json?limit=80&t=2023",
      {
        data: {
          children: [],
        },
      }
    );
    const handlePageChange = (e) => {
      setCurrentPage(Number(e.target.textContent));
    };
    let page = data.data.children;
    if (page.length >= 1) {
      page = paginate(page, currentPage, pageSize);
      console.log(`currentPage: ${currentPage}`);
    }
    return (
      <Fragment>
        {isLoading ? (
          <div className="loading">Loading...</div>
        ) : (
          <div className="container">
            <table className="table">
              <tbody>
                {page.map((item) => (
                  <tr key={item.data.id}>
                    <td>
                      {item.data.thumbnail && (
                        <img src={item.data.thumbnail} alt="Preview" style={{ maxWidth: '100px', maxHeight: '100px' }} />
                      )}
                    </td>
                    <td>
                      <a href={item.data.url} style={{ color: '#0079d3', textDecoration: 'none' }}>
                        {item.data.title}
                      </a>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
        <Pagination
          items={data.data.children}
          pageSize={pageSize}
          onPageChange={handlePageChange}
        ></Pagination>
      </Fragment>
    );
  }
  
  
  const root = ReactDOM.createRoot(document.getElementById('root'));
  root.render(<App />);
  