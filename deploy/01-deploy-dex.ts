import { DeployFunction } from "hardhat-deploy/dist/types";
import { HardhatRuntimeEnvironment } from "hardhat/types";

 const deployDex: DeployFunction =async function (hre: HardhatRuntimeEnvironment) {

     const { getNamedAccounts, deployments, network } = hre;
     const { deploy, log } = deployments;
     const { deployer } = await getNamedAccounts();
     
     const roses= await deployments.get("Roses");

     const dex = await deploy("DEX", {
         from: deployer,
         args: [roses.address],
         log: true,
     });
     console.log(`DEX contract: ${dex.address}`);
 }
export default deployDex;
deployDex.tags=["all","dex"];
