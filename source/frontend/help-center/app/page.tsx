import DropdownCard from "../components/DropdownCard";
import Card from "../components/utils/Card";
import ListCard from "../components/ListCard";
import { Youtube, FileMinus } from 'lucide-react';
import SearchResponseComponent from "@/components/SearchCard";
import Chip from "@/components/Chip";
import WaitingSection from "@/components/WaitingSection";

export default function Home() {
  return (
    <div className="mx-auto px-4 py-8">

      <Chip title="LOL"/>
      <WaitingSection/>
      
      <div className="">
        <SearchResponseComponent/>
        {/* Exemple 1 - Questions fréquentes */}
        <DropdownCard
          title="Questions épinglées"
          questions={[
            "Comment se rendre aux différents campus ?",
            "Quelles sont les aires et jours d'ouverture de la salle de sport ?"
          ]}
        />

        {/* Exemple 2 - Vidéos épinglées */}
        <ListCard
          title="Vidéos épinglées"
          items={[
            {
              icon: Youtube,
              text: "Panorama des outils digitaux",
              href: "/videos/panorama"
            },
            {
              icon: Youtube,
              text: "Bienvenue à l'ESILV !",
              href: "/videos/esilv"
            },
            {
              icon: Youtube,
              text: "Bienvenue à l'EMLV !",
              href: "/videos/emlv"
            }
          ]}
        />

        {/* Exemple 3 - Tutoriels épinglés */}
        <ListCard
          title="Tutoriels épinglés"
          items={[
            {
              icon: FileMinus,
              text: "Comment faire une capture d'écran complète ?",
              href: "/tutoriels/capture-ecran"
            },
            {
              icon: FileMinus,
              text: "Comment vider son cache ?",
              href: "/tutoriels/vider-cache"
            },
            {
              icon: FileMinus,
              text: "Comment créer une convention de stage",
              href: "/tutoriels/convention-stage"
            }
          ]}
        />
      </div>
    </div>
  );
}
