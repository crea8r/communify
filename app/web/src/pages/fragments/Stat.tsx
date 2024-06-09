import { useContext, useEffect, useRef, useState } from 'react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '../../components/ui';
import { CommunityAccountContext, MemberListContext } from '../Admin';
import fetchAllMemo from '../../services/fetchAllMemo';
import * as d3 from 'd3';
import shortenAddress from '../../funcs/shortenAddress';

const Stat = () => {
  const members = useContext(MemberListContext);
  // communiyAccount
  const communityAccount = useContext(CommunityAccountContext);
  const [interactions, setInteractions] = useState<any[]>([]);
  const [nodes, setNodes] = useState<any[]>([]);
  const width = 500;
  const height = 500;
  const ref = useRef(null);
  const tooltipRef = useRef(null);
  const mouseover = function (event: any, d: any) {
    const tooltipDiv = tooltipRef.current;
    if (tooltipDiv) {
      d3.select(tooltipDiv).transition().duration(200).style('opacity', 0.9);
      d3.select(tooltipDiv)
        .html(shortenAddress(d.id))
        // TODO: some logic when the tooltip could go out from container
        .style('left', event.pageX + 'px')
        .style('top', event.pageY - 28 + 'px');
    }
  };
  const linkOver = function (event: any, d: any) {
    console.log(d);
    const tooltipDiv = tooltipRef.current;
    if (tooltipDiv) {
      d3.select(tooltipDiv).transition().duration(200).style('opacity', 0.9);
      d3.select(tooltipDiv)
        .html(
          '<div style="background-color:#aaa"><div>from:' +
            shortenAddress(d.source.id) +
            ' to:' +
            shortenAddress(d.target.id) +
            '</div><div>' +
            d.amount +
            ',' +
            d.label +
            '</div></div>'
        )
        // TODO: some logic when the tooltip could go out from container
        .style('left', event.pageX + 'px')
        .style('top', event.pageY - 28 + 'px');
    }
  };

  const mouseout = () => {
    const tooltipDiv = tooltipRef.current;
    if (tooltipDiv) {
      d3.select(tooltipDiv).transition().duration(100).style('opacity', 0);
    }
  };
  useEffect(() => {
    if (communityAccount && members.length > 0) {
      // fetch all Memo from the blockchain
      fetchAllMemo({ community: communityAccount.publicKey }).then((memos) => {
        setNodes(
          members.map((m: any) => {
            return { id: m.member.toBase58() };
          })
        );
        setInteractions(
          memos.map((m: any) => {
            return {
              source: m.from.toBase58(),
              target: m.to.toBase58(),
              amount: m.amount.toNumber(),
              label: m.note,
            };
          })
        );
      });
    }
  }, [communityAccount, members]);

  useEffect(() => {
    const svg = d3
      .select(ref.current)
      .attr('width', width)
      .attr('height', height);
    const simulation = d3
      .forceSimulation(nodes)
      .force(
        'link',
        d3.forceLink(interactions).id((d: any) => {
          return d.id;
        })
      )
      .force('charge', d3.forceManyBody())
      .force('center', d3.forceCenter(width / 2, height / 2))
      .force('radial', d3.forceRadial(100, width / 2, height / 2));
    // Run the simulation to completion
    for (let i = 0; i < 300; ++i) simulation.tick();
    const link = svg
      .append('g')
      .selectAll('path')
      .data(interactions)
      .enter()
      .append('path')
      .attr('stroke', 'black')
      .attr('stroke-width', 1)
      .attr('fill', 'none')
      .attr('d', (d: any) => {
        const dx = d.target.x - d.source.x,
          dy = d.target.y - d.source.y,
          dr = Math.sqrt(dx * dx + dy * dy),
          mx = (d.source.x + d.target.x) / 2 + (Math.random() - 0.5) * dr,
          my = (d.source.y + d.target.y) / 2 + (Math.random() - 0.5) * dr;
        return `M${d.source.x},${d.source.y}Q${mx},${my} ${d.target.x},${d.target.y}`;
      })
      .on('mouseover', linkOver)
      .on('mouseout', mouseout);

    const nodeEnter = svg
      .append('g')
      .selectAll('circle')
      .data(nodes)
      .enter()
      .append('circle')
      .attr('r', 2)
      .attr('cx', (d: any) => d.x)
      .attr('cy', (d: any) => d.y)
      .on('mouseover', mouseover)
      .on('mouseout', mouseout);
    nodeEnter.append('title').text((d: any) => d.id);
    // node.append('title').text((d: any) => d.id);

    // Run the simulation to completion
    for (let i = 0; i < 300; ++i) simulation.tick();
  }, [nodes, interactions]);
  console.log(nodes, interactions);
  return (
    <Card>
      <CardHeader>
        <CardTitle>Community Activity</CardTitle>
        <CardDescription>Who are interacting with who?</CardDescription>
      </CardHeader>
      <CardContent>
        <div className='tooltip' ref={tooltipRef} />
        <svg ref={ref}></svg>
      </CardContent>
    </Card>
  );
};

export default Stat;
