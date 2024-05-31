import { Web3Provider } from "@ethersproject/providers";
import { useEffect, useRef, useState } from "react";
import Web3Modal from "web3modal";
import { useViewerConnection, useViewerRecord } from "@self.id/react";
import { EthereumAuthProvider } from "@self.id/web";

export default function Home() {
  const web3ModalRef = useRef();
  const [connection, connect, disconnect] = useViewerConnection();

  const getProvider = async () => {
    try {
      const provider = await web3ModalRef.current.connect();
      const wrappedProvider = new Web3Provider(provider);
      return wrappedProvider;
    } catch (error) {
      console.error("User Rejected or other error:", error);
      return null;
    }
  };

  const getEthereumAuthProvider = async () => {
    const wrappedProvider = await getProvider();
    if (!wrappedProvider) {
      return null;
    }
    const signer = wrappedProvider.getSigner();
    const address = await signer.getAddress();
    return new EthereumAuthProvider(wrappedProvider.provider, address);
  };

  const connectToSelfID = async () => {
    const ethereumAuthProvider = await getEthereumAuthProvider();
    if (ethereumAuthProvider) {
      connect(ethereumAuthProvider);
    } else {
      console.error("Failed to get Ethereum Auth Provider");
    }
  };

  useEffect(() => {
    if (connection.status !== "connected") {
      web3ModalRef.current = new Web3Modal({
        network: "goerli",
        providerOptions: {},
        disableInjectedProvider: false,
      });
    }
  }, [connection.status]);

  return (
    <div className="flex flex-col items-center justify-center min-h-screen pt-16 bg-purple-50">
      <div className="fixed top-0 left-0 flex justify-center w-full py-4 text-white bg-purple-700 shadow-md">
        <span className="text-2xl font-bold">Ceramic Demo</span>
      </div>

      <div className="w-full max-w-md p-10 mt-20 text-center bg-white rounded-lg shadow-lg">
        <div className="mb-6">
          {connection.status === "connected" ? (
            <div>
              <span className="text-lg font-semibold">
                Your 3ID is {connection.selfID.id}
              </span>
              <RecordSetter />
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center">
              <button
                onClick={connectToSelfID}
                className="px-6 py-3 mb-4 text-white bg-blue-600 rounded-lg hover:bg-blue-700 disabled:bg-gray-400"
                disabled={connection.status === "connecting"}
              >
                Connect
              </button>
              <span className="text-lg font-semibold">
                Connect with your wallet to access your 3ID
              </span>
              <p className="mt-2 text-gray-600">
                Your 3ID is a decentralized identity that allows you to manage and control your personal data on the Ceramic Network.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function RecordSetter() {
  const record = useViewerRecord("basicProfile");
  const [name, setName] = useState("");

  const updateRecordName = async (name) => {
    await record.merge({ name });
  };

  return (
    <div className="w-full max-w-md p-6 mt-6 text-center bg-white rounded-lg shadow-lg">
      <div className="mb-4">
        {record.content ? (
          <div className="flex flex-col items-center">
            <span className="text-lg font-semibold">Hello {record.content.name}!</span>
            <span>
              The above name was loaded from Ceramic Network. Try updating it below.
            </span>
          </div>
        ) : (
          <span>
            You do not have a profile record attached to your 3ID. Create a basic profile by setting a name below.
          </span>
        )}
      </div>

      <input
        type="text"
        placeholder="Name"
        value={name}
        onChange={(e) => setName(e.target.value)}
        className="w-full p-2 mt-2 border rounded-lg"
      />
      <button className="px-6 py-3 mt-4 text-white bg-blue-600 rounded-lg hover:bg-blue-700" onClick={() => updateRecordName(name)}>Update</button>
    </div>
  );
}
