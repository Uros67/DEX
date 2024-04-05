import { DeployFunction } from "hardhat-deploy/dist/types";
import { HardhatRuntimeEnvironment } from "hardhat/types";

const deployRoses: DeployFunction = async function (hre: HardhatRuntimeEnvironment) {

    const { getNamedAccounts, deployments, network } = hre;
    const { deploy, log } = deployments;
    const { deployer } = await getNamedAccounts();

    const roses = await deploy("Roses", {
        from: deployer,
        log: true,
    });
    console.log(`Roses token contract address: ${roses.address}`);
}

export default deployRoses;
deployRoses.tags=["all","roses"];