import { createClient } from "@/utils/supabase/server";
import { redirect } from "next/navigation";
import Link from "next/link";

export default async function FavoritesPage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return redirect("/sign-in");
  }

  const { data: favoriteSets, error } = await supabase
    .from("favorites")
    .select("flashcard_set_id")
    .eq("user_id", user.id);

  if (error) {
    console.error(error.message);
    return <div>Error fetching favorite flashcard sets</div>;
  }

  const favoriteSetDetails = await Promise.all(
    favoriteSets.map(async (favorite) => {
      const { data: flashcardSet } = await supabase
        .from("flashcard_set")
        .select("*")
        .eq("id", favorite.flashcard_set_id)
        .single();
      return flashcardSet;
    })
  );

  return (
    <div className="flex-1 w-full flex flex-col gap-12">
      <div className="flex flex-col gap-2 items-start">
        <h2 className="font-bold text-2xl mb-4">Your Favorite Flashcard Sets</h2>

        {favoriteSetDetails && favoriteSetDetails.length > 0 ? (
          <div className="flex flex-col gap-4">
            {favoriteSetDetails.map((set) => (
              <div key={set.id} className="flex justify-between items-center">
                <Link
                  href={`/flashcards/${set.id}/view-set`}
                  className="text-blue-500 hover:underline"
                >
                  {set.title} <span className="text-gray-500">(Favorited)</span>
                </Link>
              </div>
            ))}
          </div>
        ) : (
          <p>You haven't favorited any flashcard sets yet. Explore and discover more!</p>
        )}
      </div>
    </div>
  );
}