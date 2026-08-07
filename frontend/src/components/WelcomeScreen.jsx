import {
    BookOpen,
    FlaskConical,
    MoonStar,
    Shield,
    Sparkles,
    WandSparkles
} from "lucide-react";


function WelcomeScreen({
    onExampleClick
}) {
    return (
        <section className="welcome-screen">
            <div className="welcome-glow">
            </div>

            <div className="welcome-content">
                <div className="welcome-logo">
                    <BookOpen size={30} />
                </div>

                <div className="welcome-greeting">
                    <Sparkles size={14} />

                    <span>
                        Salut! Sunt Smart Librarian.
                    </span>
                </div>

                <p className="welcome-label">
                    SMART LIBRARIAN
                </p>

                <h2>
                    Ce ai chef sa citesti azi?
                </h2>

                <p className="welcome-description">
                    Spune-mi ce teme, atmosfera sau tip de
                    poveste cauti, iar eu iti voi gasi o
                    carte potrivita.
                </p>

                <div className="suggestion-grid">
                    <button
                        type="button"
                        className="suggestion-card"
                        onClick={function () {
                            onExampleClick(
                                "Vreau o carte despre magie, prietenie si aventura."
                            );
                        }}
                    >
                        <div className="suggestion-icon purple-icon">
                            <WandSparkles size={21} />
                        </div>

                        <div>
                            <strong>
                                Magie & aventura
                            </strong>

                            <span>
                                Lumi fantastice si calatorii
                            </span>
                        </div>
                    </button>

                    <button
                        type="button"
                        className="suggestion-card"
                        onClick={function () {
                            onExampleClick(
                                "Vreau o carte despre libertate si control social."
                            );
                        }}
                    >
                        <div className="suggestion-icon blue-icon">
                            <Shield size={21} />
                        </div>

                        <div>
                            <strong>
                                Libertate & distopie
                            </strong>

                            <span>
                                Societate, control si revolta
                            </span>
                        </div>
                    </button>

                    <button
                        type="button"
                        className="suggestion-card"
                        onClick={function () {
                            onExampleClick(
                                "Vreau o poveste despre razboi, trauma si prietenie."
                            );
                        }}
                    >
                        <div className="suggestion-icon pink-icon">
                            <MoonStar size={21} />
                        </div>

                        <div>
                            <strong>
                                Razboi & emotie
                            </strong>

                            <span>
                                Povesti umane si puternice
                            </span>
                        </div>
                    </button>

                    <button
                        type="button"
                        className="suggestion-card"
                        onClick={function () {
                            onExampleClick(
                                "Vreau o carte despre supravietuire folosind stiinta."
                            );
                        }}
                    >
                        <div className="suggestion-icon cyan-icon">
                            <FlaskConical size={21} />
                        </div>

                        <div>
                            <strong>
                                Stiinta & supravietuire
                            </strong>

                            <span>
                                Probleme, solutii si aventura
                            </span>
                        </div>
                    </button>
                </div>

                <div className="welcome-feature">
                    <Sparkles size={15} />

                    <span>
                        Recomandari bazate pe cautare semantica
                    </span>
                </div>
            </div>
        </section>
    );
}


export default WelcomeScreen;