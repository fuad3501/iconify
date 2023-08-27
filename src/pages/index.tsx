import { type NextPage } from "next";
import Head from "next/head";
import Image from "next/image";
import { PrimaryLinkButton } from "~/components/PrimaryLinkButton";

function HeroBanner(){
  return <section className="grid grid-cols-1 sm:grid-cols-2 gap-12 px-8 mt-12 mb-24 sm:mt-24 ">
    <div className="flex flex-col gap-4">
      <h1 className="text-6xl">Generate icons with a click of a button</h1>
      <p className="text-2xl">Use AI to generate icons instead of paying a designer to create them for you</p>
      <PrimaryLinkButton className="self-start" href="/generate">Generate Now</PrimaryLinkButton>
    </div>
    <Image src="/banner.png" alt="Banner" width="400" height="300" className="order-first sm:-order-none"></Image>
  </section>
}

const Home: NextPage = () => {

  return (
    <>
      <Head>
        <title>Iconify :: Home</title>
        <meta name="description" content="Generated by create-t3-app" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <main className="container mx-auto flex flex-col items-center justify-center">
        <HeroBanner />
      </main>
    </>
  );
};

export default Home;
