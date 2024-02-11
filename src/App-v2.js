import {NavBar, Logo, NumResults} from "./NavBar";
import {Main, MovieList, Box, WatchedSummary, WatchedMovieFilms} from "./Main";
import {useEffect, useState} from "react";
import Search from "./Search";
import StarRating from "./StarRating";

const KEY = process.env.REACT_APP_API_KEY;

export default function App() {
    const [movies, setMovies] = useState([]);
    const [watched, setWatched] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');
    const [query, setQuery] = useState("");
    const [selectedId, setSelectedId] = useState(null);

    function handleSelectMovie(id) {
        setSelectedId(selectedId => (id === selectedId ? null : id));
    }

    function handleCloseMovie() {
        setSelectedId(null);
    }

    function handleAddWatched(movie) {
        setWatched((watched) => [...watched, movie]);
    }

    function handleDeleteWatched(id) {
        setWatched((watched) => watched.filter((movie) => movie.imdbId !== id));
    }

    useEffect( function() {
        const controller = new AbortController();

        async function fetchMovies() {
            try {
                setIsLoading(true);
                setError('');
                const res = await fetch(
                    `http://www.omdbapi.com/?apikey=${KEY}&s=${query}`,
                    { signal: controller.signal });

                if(!res.ok) throw new Error("Something went wrong with fetching movies");

                const data = await res.json();
                if (data.Response === 'False') throw new Error("Movie not found");

                setMovies(data.Search);
                setIsLoading(false);
            } catch (err) {
                console.error(err.message);
                if(err.name !== "AbortError") {
                    setError(err.message);
                }
            } finally {
                setIsLoading(false);
            }
        }

        if(query.length < 3) {
            setMovies([]);
            setError('');
            return;
        }

        handleCloseMovie();
        fetchMovies();

        return function() {
            controller.abort();
        }
    }, [query]);

  return (
    <>
        <NavBar movies={movies}>
            <Logo/>
            <Search query={query} setQuery={setQuery}/>
            <NumResults movies={movies}/>
        </NavBar>
        <Main>
            <Box>
                {isLoading && <Loader/>}
                {!isLoading && !error && <MovieList movies={movies} onSelectMovie={handleSelectMovie}/>}
                {error && <ErrorMessage message={error}/>}
            </Box>

            <Box>
                {   selectedId ? <MovieDetails
                        selectedId={selectedId}
                        onCloseMovie={handleCloseMovie}
                        onAddWatched={handleAddWatched}
                        watched={watched}
                    /> :
                    <>
                        <WatchedSummary watched={watched}/>
                        <WatchedMovieFilms watched={watched} onDeleteWatched={handleDeleteWatched}/>
                    </>}
            </Box>
        </Main>
    </>
  );
}

function Loader() {
    return (
        <p className={'loader'}>Loading...</p>
    )
}

function ErrorMessage({message}) {
    return (
        <p className={'error'}>
            <span>⛔️</span> {message}
        </p>
    )
}

function MovieDetails({selectedId, onCloseMovie, onAddWatched, watched}) {
    const [movie, setMovie] = useState({});
    const [isLoading, setIsLoading] = useState(false);
    const [userRating, setUserRating] = useState('');

    const isWatched = watched.map(movie => movie.imdbId).includes(selectedId);
    const watchedUserRating = watched.find(movie=> movie.imdbId === selectedId)?.userRating;

    const {
        Title: title,
        Year: year,
        Poster: poster,
        Runtime: runtime,
        imdbRating,
        Plot: plot,
        Released: released,
        Actors: actors,
        Director: director,
        Genre: genre,
    } = movie;

    function handleAdd() {
        const newWatchedMovie = {
            imdbId: selectedId,
            title,
            year,
            poster,
            imdbRating: Number(imdbRating),
            runtime: +runtime.split(' ').at(0),
            userRating,
        }
        onAddWatched(newWatchedMovie);
        onCloseMovie();
    }

    useEffect(function (){
        async function getMovieDetails() {
            setIsLoading(true);
            const res = await fetch(`http://www.omdbapi.com/?apikey=${KEY}&i=${selectedId}`);
            const data = await res.json();
            setMovie(data);
            setIsLoading(false);
        };
        getMovieDetails();
    }, [selectedId]);

    useEffect(function() {
        if(!title) return;
        document.title = `Movie | ${title}`;

        return function (){
            document.title = 'usePopcorn';
        }
    }, [title]);

    useEffect(() => {
        function callback (e) {
            if (e.code === 'Escape') {
                onCloseMovie();
            }
        }

        document.addEventListener('keydown', callback);

        return function () {
            document.removeEventListener('keydown', callback);
        }
    }, [onCloseMovie]);

    return (
      <div className={'details'}>
          {isLoading ? <Loader /> :
              (<>
                  <header>
                      <button className={'btn-back'} onClick={onCloseMovie}>&larr;</button>
                      <img src={poster} alt={`Poster of ${movie} movie`}/>
                      <div className="details-overview">
                          <h2>{title}</h2>
                          <p>
                              {released} &bull; {runtime}
                          </p>
                          <p>{genre}</p>
                          <p>
                              <span>⭐️</span>
                              {imdbRating} IMDb rating
                          </p>
                      </div>
                  </header>

                  <section>
                      <div className={'rating'}>
                          {!isWatched ?
                              <>
                              <StarRating
                                  maxRating={10}
                                  size={24}
                                  onSetRating={setUserRating}
                              />

                              {userRating > 0 && (
                              <button className={'btn-add'} onClick={handleAdd}>
                                  + Add to list
                              </button>
                              )
                              }
                              </> :
                              (<p>You rated this movie {watchedUserRating} <span>⭐️</span></p>)
                          }
                      </div>
                      <p><em>{plot}</em></p>
                      <p>Starring {actors}</p>
                      <p>Directed by {director}</p>
                  </section>
              </>
              )
          }
      </div>
    );
}