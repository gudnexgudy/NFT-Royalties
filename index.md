# {#nfr} NFT Royalty

NFT Royalty is a command-line and Web-based application that enables three participants (a `seller`, a `buyer` and a `broker`) to trade NFTs for royalty tokens via a Reach Decentralized Application (DApp). 
Reach programs are built using a Docker container on your computer.

NFT Royalty creates a payment plan that compensate creators, enabling the seller and buyer to make a transaction, and then exits.

This tutorial walks through the creation of a simple decentralized application.
This tutorial contains everything you need to know to build and test this application and assumes no prior experience with DApp/blockchain development of any kind. If you need help installing Reach and its prerequisites then get started at our [Quick Installation Guide](##nfr-2)
If you want a broad overview before diving in it, we recommend reading [the overview](##overview) first.

If you're ready, click through to the [first step](##nfr-2)!

# {#nfr-1} Learning Objectives

At the end of this tutorial you will be able to:

1. Install and Initialize
1. Scaffolding and Setup.
1. Build a Reach command-line DApp.
1. Convert the command-line DApp into a Web-app.

## {#nfr-2} Install and Initialize

Reach is designed to work on POSIX systems with [make](https://en.wikipedia.org/wiki/Make_(software)), [Docker](https://www.docker.com/get-started), and [Docker Compose](https://docs.docker.com/compose/install/) installed.
The best way to install Docker on Mac and Windows is with [Docker Desktop](https://www.docker.com/products/docker-desktop).

:::note
You probably already have `make` installed.
For example, OS X and many other POSIX systems come with `make`, but some versions of Linux do not include it by default and will require you to install it.
If you're on Ubuntu, you can run `sudo apt install make` to get it.
:::

You'll know that you have everything installed if you can run the following three commands without errors

```cmd
$ make --version
```

```cmd
$ docker --version
```

```cmd
$ docker-compose --version
```

:::note
If you're using Windows, consult [the guide to using Reach on Windows](##guide-windows).
:::

Once you've confirmed that they are installed, choose a directory for this project. We recommend

```cmd
$ mkdir -p ~/reach/nfte && cd ~/reach/nfte
```

Next, download Reach by running

```cmd
$ curl https://docs.reach.sh/reach -o reach ; chmod +x reach
```

You'll know that the download worked if you can run

```cmd
$ ./reach version
```

The recommended next step, although optional, is to set up your environment with

```cmd
$ ./reach config
```

This will make subsequent uses of the `reach` script more convenient by tuning its runtime behavior to your specific needs and only downloading the dependencies you'll actually use.

`{!cmd} reach config` sets overridable defaults for _all_ Reach projects on your development machine and not just the current one, so feel free to skip this step if you'd prefer not to make your choices global.

Since Reach is Dockerized, when you first use it, you'll need to download the images it uses.
Fetch them by running

```cmd
$ ./reach update
```

You'll know that everything is in order if you can run

```cmd
$ ./reach compile --help
```

---

:::note
Get language support for Reach in your editor by visiting @{seclink("guide-editor-support")}.
:::

Now that your Reach installation is in order, you should open a text editor and get ready to [write your first Reach application](##nfr-3)!


# {#nfr-3} Scaffolding and Setup

In this tutuorial, we'll be building a version of _NFT Royalty!_ where three participants, _Creator_, _Buyer_ and _Broker_, can wager on the result.
We'll start simple and slowly mmake the application more fully-featured.

You should follow along by copying each part of the program and seeing how things go.
If you're like us, you may find it beneficial to type each line out, rather than copying & pasting so you can start building your muscle memory and begin to get a sense for each part of a Reach program.

Let's start by creating a file nammed `index.rsh`.
It doesn't matter where you put this file, but we recommend putting it in the current directory, which would be `~/reach/nfr` if you're following along exactly.
In all the subsequent code samples, we'll label the files based on the chapter of the tutorial you're reading.
For example, start off by typing the following into `index.rsh`:

``` js
'reach 0.1';

export const main = Reach.App(() => {
  const Creator = Participant('Creator', {
    // Specify Creator's interact interface here
  });
  const Buyer   = Participant('Buyer', {
    // Specify Buyer's interact interface here
  });
  const Broker   = Participant('Broker', {
    // Specify Broker's interact interface here
  });
  init();
   // write your program here
   
 });  
  ```

:::note
Did you notice the attractive copy icon on the top the right of that box?
You can click on it and the content of the code box will be copied onto your clipboard.
:::

:::note
Did your text editor recognize `index.rsh` as a Reach program and give you proper syntax highlighting?
If not, check if there's a plugin available for your editor by visiting @{seclink("guide-editor-support")} or manually
configure it to treat Reach (`.rsh`) files as JavaScript and things will be mostly correct.
:::

This is just a shell of a program that doesn't do much, but it has a few important components.

+ Line 1 indicates that this is a Reach program.
You'll always have this at the top of every program.
+ Line 3 defines the main export from the program.
When you compile, this is what the compiler will look at.
+ Lines 4 through 12 specify the three participants to this application, _Creator_, _Buyer_, and _Broker_.
+ Line 15 marks the deployment of the the Reach program, which allows the program to start doing things.

Before we go too much further, let's create a similar shell for our JavaScript frontend code.
Open a new file named `index.mjs` and fill it with this:

`` js
import { loadStdlib } from '@reach-sh/stdlib';
import * as backend from './build/index.main.mjs';
const stdlib = loadStdlib();

const startingBalance = stdlib.parseCurrency(100);
const accCreator = await stdlib.newTestAccount(startingBalance);
const accBuyer = await stdlib.newTestAccount(startingBalance);
const accBroker = await stdlib.newTestAccount(startingBalance);

const ctcCreator = accCreator.contract(backend);
const ctcBuyer = accBuyer.contract(backend, ctcCreator.getInfo());
const ctcBroker = accBroker.contract(backend, ctcCreator.getInfo());

await Promise.all([
  ctcCreator.p.Creator({
    // implement Creator's interact object here
  }),
  ctcBuyer.p.Buyer({
    // implement Buyer's interact object here
  }),
  ctcBroker.p.Broker({
    // implement Broker's interact object here
]);
  ```
  
This JavaScript code is similarly schematic and will be consistent across all of your test programs.

+ Line 1 imports the Reach standard library loader.
+ Line 2 imports your backend, which `./reach compile` will produce.
+ Line 3 loads the standard library dynamically based on the `REACH_CONNECTOR_MODE` environment variable.
+ Line 5 defines a quantity of network tokens as the starting balance for each test account.
+ Lines 6, 7 and 8 create test accounts with initial endowments for Creator, Buyer and Broker.
This will only work on the Reach-provided developer testing network.
+ Line 10 has Creator deploy the application.

+ Line 11 has Buyer attach to it.
+ Line 12 has Broker attach to it.
+ Lines 13 through 15 initialize a backend for Alice.
+ Lines 16 through 18 initialize a backend for Bob.
+ Line 12 waits for the backends to complete.

This is now enough for Reach to compile and run our program. Let's try by running

```cmd
$ ./reach run
```
  

Reach programs (the `index.rsh` portion of your Reach DApp) are organized into four modes: `Init Mode`, `Step Mode`, `Local 
Step Mode`, and `Consensus Step Mode`.

### {#nfr-4} Init Mode

Application Initialization defines participants and views.

Lines 2, 3 and 4 below occur in the App Init section of the program:

``` js
'reach 0.1';

export const main = Reach.App(() => {
  const A = Participant('A', {
    ...Creator,
    id: UInt, // id of NFT
    price: UInt, // price
    tax: UInt, // tax
  });
  const B   = Participant('B', {
    ...Buyer
  });
  const C   = Participant('C', {
    ...Broker
  });
  deploy();
  ```
  
The `{!rsh} init` function transitions the program from `App Init` to `Step`.

### {#nfr-5} Step Mode
A `Step` specifies actions taken by each and every participant. 
`exit()`, for example, is a function that must occur within a step, and it means that each and every participant exits 
the contract after which that instance of the contract becomes forever unavailable.

### {#nfr-6} Local Step Mode
A `Local Step` specifies actions taken by a single participant. 
Local steps must occur within the body of `{!rsh} only` or `{!rsh} each` statements. 
Here is an example:

``` js
A.only(() => {
    const id = declassify(interact.getId());
    const price = declassify(interact.getPrice());
    const tax = declassify(interact.getTax());
  });
  ```
  
`{!rsh} only()` and `{!rsh} each()` transition to a local step and then back to the originating mode (either `Step` or 
`Consensus Step`).

### {#nfr-7} Consensus Step Mode

A `Consensus Step` specifies actions taken by the contract itself. 
Later in this tutorial, the contract calls `{!rsh} transfer` to transfer funds from the contract to the `seller`.

# {#nfr-8} Pre-coding preparation

Before you start to code, it is a good idea to think about the application that you want to create and write down a plan 
for the actions. 
This makes it easier to code the app, add in all of the functionality, and be less likely to make a mistake.

NFT with Royalty requirements:

1. NFT with Royalty requires three participants, a `Buyer`, a `Broker` and a `Seller`.
1. The `buyer` will need a pay function and a function that displays the purchased NFT.
1. The `broker` will need a function to hold the price and the NFT to be released to both seller and buyer.
1. The `seller` will need a function to input the NFT, and to put it up for sale.
1. Participants will be publishing information: the seller will publish the NFT and the price, the buyer 
will publish their decision to purchase, and the broker will release it to bothe the seller and buyer.
1. The `buyer` needs to be able to decide to NOT purchase the wisdom, so we need to create a function for cancelling 
the sale.
1. If the `buyer` does decide to buy the wisdom, then there needs to be a function that reports the payment to both the 
`seller` and the `buyer`.

# {#nfr-9} Examine the transaction

This particular transaction took place on an Algorand devnet. 
The Algorand cryptocurrency standard token unit is the `ALGO`. 
These expenses represent `fees`, the cost of doing business on a consensus network. 
The `seller` paid a little more fees than the `buyer` because the `seller` paid a small fee to deploy the contract.

# {#nfr-10} Create the files
Create a project folder and `{!cmd} cd` into it via the command line.

```cmd
$ mkdir -p ~/reach/nfte && cd ~/reach/nfte
```

Create `index.js` and `index.rsh` in your project folder and open both new files in your preferred editor.

![Open VSCode](/assets/vscode.png)

## {#wfs-11} Create the Frontend

Type the following code into the file named `index.js`.

``` js
load: /examples/wisdom-1-starter/index.js
md5: 77f7503ee58c2459f3793262212ca702
range: 1-8
```

Line 1: 
