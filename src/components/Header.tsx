import { signIn, signOut, useSession } from "next-auth/react";
import { useBuyCredits } from "~/hooks/useBuyCredits";
import { Button } from "./Button";
import { PrimaryLink } from "./PrimaryLink";

export function Header () {

    const session = useSession();
    const isLoggedIn = !!session.data;
    const { buyCredits } = useBuyCredits();

    return <header className=" px-4 container mx-auto dark: bg-gray-800 flex justify-between h-16 items-center">
        <PrimaryLink href="/">Home</PrimaryLink>
            <ul>
                <li><PrimaryLink href="/generate">Generate</PrimaryLink></li>
            </ul>

            <ul className="flex gap-4">
    
                {isLoggedIn && 
                <> 
                <li>
                    <Button onClick={() => {
                    buyCredits().catch(console.error)}}>Buy Credits</Button>
                </li>
                <li>
                    <Button variant="secondary" onClick={() => {
                    signOut().catch(console.error);
                }}>Logout</Button>
                </li>
                <li>
                    {session.data?.user.name}
                </li>
                </>
                }

                {!isLoggedIn && <li> <Button onClick={() => {
                signIn().catch(console.error);
                }}>Login</Button></li>} 
                
                
            </ul>
    </header>
}