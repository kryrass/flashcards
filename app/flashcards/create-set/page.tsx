'use client';


import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { createClient } from '../../../utils/supabase/client';
import FlashcardForm from '../../../components/flashcard-form';
import { Button } from "../../../components/ui/button";


const supabase = createClient();


type FlashcardSet = {
 title: string;
 description: string;
 user_id: string;
};


type Flashcard = {
 term: string;
 definition: string;
 flashcard_set_id: number;
};


export default function CreateSetPage() {
 const [title, setTitle] = useState('');
 const [description, setDescription] = useState('');
 const [error, setError] = useState('');
 const [success, setSuccess] = useState('');
 const [userId, setUserId] = useState<string | null>(null);
 const [isPublic, setIsPublic] = useState(false)


 const [cards, setCards] = useState<{ term: string; definition: string }[]>([
   { term: '', definition: '' },
 ]);


 useEffect(() => {
   const getUser = async () => {
     const { data, error: userError } = await supabase.auth.getUser();
     if (userError) {
       setError(userError.message);
     } else if (data?.user) {
       setUserId(data.user.id);
     } else {
       setError('You must be logged in to create a flashcard set.');
     }
   };


   getUser();
 }, []);


 const handleCreateSet = async (e: React.FormEvent) => {
   e.preventDefault();
   setError(''); 
   setSuccess('');


   if (!title) {
     setError('Title is required');
     return;
   }


   if (!userId) {
     setError('User is not logged in');
     return;
   }


   const { data: setData, error: setErrorFromDB } = await supabase
     .from('flashcard_set')
     .insert({
       title,
       description,
       user_id: userId,
       is_public: isPublic,
       created_date: new Date().toISOString(),
     })
     .select('id');


   if (setErrorFromDB) {
     setError(setErrorFromDB.message); 
     return;
   }


   const flashcardSetId = setData?.[0]?.id;


   if (!flashcardSetId) {
     setError('Failed to create flashcard set.');
     return;
   }


   const flashcardsToInsert: Flashcard[] = cards.map((card) => ({
     term: card.term,
     definition: card.definition,
     flashcard_set_id: flashcardSetId, 
   }));


   const { error: cardError } = await supabase
     .from('card')
     .insert(flashcardsToInsert);


   if (cardError) {
     setError(cardError.message); 
   } else {
     setSuccess('Flashcard set created successfully with cards!');
     setTitle('');
     setDescription('');
     setCards([{ term: '', definition: '' }]);
   }
 };


 const handleCardChange = (index: number, field: 'term' | 'definition', value: string) => {
   const updatedCards = [...cards];
   updatedCards[index][field] = value;
   setCards(updatedCards);
 };


 const handleAddCard = () => {
   setCards([...cards, { term: '', definition: '' }]);
 };


 const handleDeleteCard = (index: number) => {
   const updatedCards = cards.filter((_, i) => i !== index);
   setCards(updatedCards);
 };


 return (
   <div>
     <form onSubmit={handleCreateSet}>
       <FlashcardForm
         title={title}
         setTitle={setTitle}
         description={description}
         setDescription={setDescription}
         cards={cards}
         onCardChange={handleCardChange}
         onAddCard={handleAddCard}
         onDeleteCard={handleDeleteCard}
         isPublic={isPublic}
         setIsPublic={setIsPublic}
         formTitle="Create a Flashcard Set"
       />
	{error && <p style={{ color: 'red' }}>{error}</p>}
       {success && <p style={{ color: 'green' }}>{success}</p>}
       <Button
         type="submit"
         style={saveButtonStyle}
       >
         Create Set
       </Button>
     </form>
   </div>
 );
}


const saveButtonStyle: React.CSSProperties = {
 fontSize: '1.3em',
 padding: '10px 20px',
 backgroundColor: '#ff0f7b',
 color: '#fff',
 border: 'none',
 borderRadius: '4px',
 cursor: 'pointer',
 display: 'block',
 width: '100%',
 marginTop: '20px',
 transition: 'background-color 0.3s ease',
};


const saveButtonHoverStyle: React.CSSProperties = {
 backgroundColor: '#ff2d8f',
};


//muudetud
