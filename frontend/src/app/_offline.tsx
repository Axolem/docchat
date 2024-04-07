import Head from "next/head";

export default function Offline() {
    return (
        <>
            <Head>
                <title>Doc Chat</title>
            </Head>
            <h1>This is offline fallback page</h1>
            <h2>You are offline open the internet gates...</h2>
        </>
    );
}
