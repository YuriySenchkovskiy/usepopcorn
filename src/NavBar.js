import Search from "./Search";

function NavBar({children}) {
    return (
        <nav className="nav-bar">
            {children}
        </nav>
    )
}

function Logo() {
    return (
        <div className="logo">
            <span role="img">🍿</span>
            <h1>usePopcorn</h1>
        </div>
    );
}

function NumResults({movies}) {
    return (
        <p className="num-results">
            {/*Found <strong>{movies.length}</strong> results*/}
            Found <strong>{movies.length}</strong> results
        </p>
    );
}

export {NavBar, Logo, NumResults}