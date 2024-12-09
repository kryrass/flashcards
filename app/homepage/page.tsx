import { createClient } from "@/utils/supabase/server";
import { redirect } from "next/navigation";
import Link from "next/link";
import Card from "@/components/card";

export default async function HomePage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return redirect("https://flashcards-eight-beryl.vercel.app/");
  }

  const { data: flashcardSets, error } = await supabase
    .from("flashcard_set")
    .select("id, title, user_id, is_public, created_date")
    .or(`user_id.eq.${user.id},is_public.eq.true`);

  if (error) {
    console.error(error.message);
    return (
      <div>
        <p>Error fetching flashcard sets</p>
      </div>
    );
  }

  const yourSets = flashcardSets.filter((set) => set.user_id === user.id);
  const publicSets = flashcardSets.filter((set) => set.is_public && set.user_id !== user.id);

  const sortedYourSets = yourSets.sort((a, b) => new Date(b.created_date).getTime() - new Date(a.created_date).getTime());
  const sortedPublicSets = publicSets.sort((a, b) => new Date(b.created_date).getTime() - new Date(a.created_date).getTime());

  const getTermCount = async (setId: number) => {
    const { data, error } = await supabase
      .from("card")
      .select("id")
      .eq("flashcard_set_id", setId);

    if (error) {
      console.error(`Error fetching terms for set ${setId}:`, error.message);
      return 0;
    }
    return data.length; 
  };

  const { data: favoriteSets, error: favoriteError } = await supabase
    .from("favorites")
    .select("flashcard_set_id")
    .eq("user_id", user.id);

  if (favoriteError) {
    console.error(favoriteError.message);
  }

  const favoriteSetDetails = favoriteSets
  ? await Promise.all(
      favoriteSets.map(async (favorite) => {
        const { data: flashcardSet } = await supabase
          .from("flashcard_set")
          .select("*")
          .eq("id", favorite.flashcard_set_id)
          .single();
        return flashcardSet;
      })
    )
  : [];


  const sortedFavoriteSets = favoriteSetDetails.sort((a, b) => new Date(b.created_date).getTime() - new Date(a.created_date).getTime());

  return (
    <div className="flex-1 w-full flex flex-col gap-12">
      <div className="flex flex-col gap-2 items-start">
        <h2 className="font-bold text-[2.5em] mb-4">Welcome to Flashcards!</h2>

        <Link href="/flashcards/your-sets">
          <h3 className="text-2xl mb-4 hover:text-pink-500">See your Sets</h3>
        </Link>
        {sortedYourSets.length > 0 ? (
          <div className="flex flex-wrap gap-4">
            {sortedYourSets.slice(0, 3).map(async (set) => (
              <Card
                key={set.id}
                title={set.title}
                id={set.id}
                termCount={await getTermCount(set.id)} 
                link={`/flashcards/${set.id}/view-set`}
                isPublic={set.is_public} 
              />
            ))}
          </div>
        ) : (
          <p>You haven't created any flashcard sets yet. Create one to get started.</p>
        )}

        <Link href="/flashcards/discover">
          <h3 className="text-2xl mb-2 mt-8 hover:text-pink-500">Click to discover</h3>
        </Link>
        {sortedPublicSets.length > 0 ? (
          <div className="flex flex-wrap gap-4">
            {sortedPublicSets.slice(0, 3).map(async (set) => (
              <Card
                key={set.id}
                title={set.title}
                id={set.id}
                termCount={await getTermCount(set.id)} 
                link={`/flashcards/${set.id}/view-set`}
                isPublic={set.is_public}
              />
            ))}
          </div>
        ) : (
          <p>No public flashcard sets found. Explore and discover more!</p>
        )}

        <Link href="/flashcards/favorites">
          <h3 className="text-2xl mb-2 mt-8 hover:text-pink-500">See your favorites</h3>
        </Link>
        {sortedFavoriteSets.length > 0 ? (
          <div className="flex flex-wrap gap-4">
            {sortedFavoriteSets.slice(0, 3).map(async (set) => (
              <Card
                key={set.id}
                title={set.title}
                id={set.id}
                termCount={await getTermCount(set.id)} 
                link={`/flashcards/${set.id}/view-set`}
                isPublic={set.is_public} 
              />
            ))}
          </div>
        ) : (
          <p>No favorited flashcard sets found. Explore and discover more!</p>
        )}

        <Link href="/flashcards/create-set">
          <button className="mt-8 px-4 py-2 bg-[#BDB2FF] text-white rounded hover:bg-[#BDB2FF] hover:opacity-80">
            Create a New Flashcard Set
          </button>
        </Link>
      </div>
    </div>
  );
}
