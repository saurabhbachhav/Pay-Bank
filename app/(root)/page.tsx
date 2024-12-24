import HeaderBox from '@/components/HeaderBox'
import TotalBalancebox from '@/components/TotalBalanceBox';
import React from 'react'
import RightSidebar from '@/components/RightSidebar';
import { getLoggedInUser } from '@/lib/actions/user.actions';

const Home = async () => {
  const loggedIn = await getLoggedInUser();
  return (
    <div>
      <section className="home">
        <div className="home-content">
          <header className="home-header">
            <HeaderBox
              type="greeting"
              title="Welcome"
              user={loggedIn?.name || "Guest"}
              subtext="Access and manage Your account ans transactions efficiently."
            />
            <TotalBalancebox
              accounts={[]}
              totalBanks={1}
              totalCurrentBalance={1250.35}
            />
          </header>
          RECENT TRANSACTIONS
        </div>

        <RightSidebar
          user={loggedIn}
          transactions={[]}
          banks={[{ currentBalance: 3001.2 }, { currentBalance: 10230.2 }]}
        />
      </section>
    </div>
  );
}

export default Home
