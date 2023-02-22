import { Button, Input, notification, Spin } from "antd";
import React, { useState } from "react";
import axios from "axios";

function ClaimTokens({ userSigner, address, updateBalanceBuidl }) {
  const [orderID, setOrderID] = useState();
  const [loading, setLoading] = useState(false);

  const handleClaim = async () => {
    const token = "5e884898da28047151d0e56f8dc6292773603d0d6aabbdd62a11ef721d1542d8";

    try {
      setLoading(true);

      const resultRegister = await axios.post(
        `https://staging.ethdenver2023.zksync.dev/v1/registrationEvent?token=${token}`,
        {
          name: "Test",
          lastName: "Damu",
          email: "damu@gmail.com",
          // enter any random id and hit this api (from browser or any api client) this address will get registered with order id
          orderID: orderID,
          walletAddress: "0x0fAb64624733a7020D332203568754EB1a37DB89",
          scanTimestamp: "2023-01-18T19:11:04.078Z",
          access: "granted",
          attempt: 0,
          previousAttemptTimestamp: "2023-01-18T17:51:30.344Z",
        },
      );

      console.log("register result: ", resultRegister);

      const messageToSign = "Please sign this message to validate you are the owner of your wallet";

      const signature = await userSigner.signMessage(messageToSign);
      console.log("signature: ", signature);

      try {
        const resultClaim = await axios.post(`https://staging.ethdenver2023.zksync.dev/v1/tickets/${orderID}/claim`, {
          publicAddress: address,
          signature: signature,
        });

        console.log("claim result: ", resultClaim);
        notification.success({
          message: "Tokens claimed!",
          description: `You claimed ${resultClaim.data.tokensToClaim} Buidl tokens.`,
          placement: "topRight",
        });
        window.plausible("Claimed", { props: { orderID: orderID } });
        await new Promise(r => setTimeout(r, 10000));
        updateBalanceBuidl();
        setLoading(false);
      } catch (error) {
        if (error?.response) {
          console.log(`n-🔴 => error?.response?.data`, error?.response?.data);
          notification.error({
            message: "Error claiming tokens!",
            description: error?.response?.data?.message,
            placement: "topRight",
          });
        }
        window.plausible("ClaimError", { props: { message: error?.response?.data?.message } });
        setLoading(false);
      }
    } catch (error) {
      if (error?.response) {
        console.log(`n-🔴 => error?.response?.data`, error?.response?.data);
        notification.error({
          message: "Error claiming tokens!",
          description: error?.response?.data?.message,
          placement: "topRight",
        });
        window.plausible("ClaimError", { props: { message: error?.response?.data?.message } });
      }
      setLoading(false);
    }
  };

  return (
    <div style={{ width: 300, margin: "0 auto", marginBottom: 20 }}>
      <h2>Claim Buidl Tokens</h2>
      <Input
        value={orderID}
        onChange={e => {
          setOrderID(e.target.value);
        }}
        placeholder="OrderID"
      />
      <Button type="primary" className="plausible-event-name=ClaimClick" disabled={loading} onClick={handleClaim}>
        Claim
      </Button>
      {loading && <Spin />}
    </div>
  );
}

export default ClaimTokens;