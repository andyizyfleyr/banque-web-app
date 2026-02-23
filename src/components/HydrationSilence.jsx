"use client";

import { useEffect } from "react";

/**
 * HydrationSilence
 * 
 * Ce composant est un "silencieux" pour les erreurs d'hydratation spécifiques
 * causées par des extensions de navigateur (comme Bitwarden, AdBlock, etc.)
 * qui injectent des attributs (ex: bis_skin_checked) dans le DOM avant que React n'ait fini d'hydrater.
 * 
 * Il intercepte console.error et masque ces avertissements bénins pour garder la console propre.
 */
export default function HydrationSilence() {
    useEffect(() => {
        // Sauvegarde de la fonction console.error originale
        const originalError = console.error;

        // Surcharge de console.error
        console.error = (...args) => {
            const errorString = args.join(' ');

            // Liste des marqueurs d'erreurs à ignorer
            const ignoreMarkers = [
                "bis_skin_checked",
                "Hydration failed because the initial UI does not match",
                "There was an error while hydrating",
                "A tree hydrated but some attributes",
                "MetadataWrapper" // Cible l'erreur spécifique rapportée
            ];

            // Si l'erreur contient un des marqueurs, on l'ignorer
            if (ignoreMarkers.some(marker => errorString.includes(marker))) {
                return;
            }

            // Sinon, on laisse passer l'erreur normalement
            originalError.apply(console, args);
        };

        // Nettoyage au démontage
        return () => {
            console.error = originalError;
        };
    }, []);

    return null;
}
