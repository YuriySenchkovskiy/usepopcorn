import NavBar from "./NavBar";
import Main from "./Main";
import {useState} from "react";
import Search from "./Search";
import {useMovies} from "./useMovies";
import {useLocalStorageState} from "./useLocalStorageState";
import Loader from "./Loader";
import ErrorMessage from "./ErrorMessage";
import MovieDetails from "./MovieDetails";
import Logo from "./Logo";
import NumResults from "./NumResults";
import Box from "./Box";
import MovieList from "./MovieList";
import WatchedSummary from "./WatchedSummary";
import WatchedMovieFilms from "./WatchedMovieFilms";

export default function App() {
    const [query, setQuery] = useState("");
    const [selectedId, setSelectedId] = useState(null);

    const {movies, isLoading, error} =  useMovies(query, handleCloseMovie);
    const [watched, setWatched] = useLocalStorageState([], 'watched');

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
